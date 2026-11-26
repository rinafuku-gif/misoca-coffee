import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';

describe('every public consumer respects revocable media and nullable reference prices',()=>{
 it.each(['src/app/page.tsx','src/app/blog/page.tsx','src/app/blog/[id]/page.tsx'])('article cover bypasses optimizer in %s',path=>{
  const source=readFileSync(path,'utf8'),covers=[...source.matchAll(/<Image\s[\s\S]*?\/>/g)].filter(m=>m[0].includes('src={post.coverImage}'));
  expect(covers).toHaveLength(1);
  expect(covers[0][0]).toContain('unoptimized={post.coverImage.startsWith("/api/notion-image/")}');
 });
 it.each([['src/app/page.tsx','item'],['src/features/shop/components/ShopCatalog.tsx','product']])('public catalog validates API and does not invent fallback rows in %s',(path,item)=>{
  const source=readFileSync(path,'utf8');
  expect(source).toContain('ProductSchema.array().max(500).safeParse');
  expect(source).toContain(`catalogPriceLabel(${item})`);
  // ShopCatalog draws its photos through the shared ProductPhoto (checked below).
  expect(source).toContain(path.endsWith('ShopCatalog.tsx')?`<ProductPhoto image={${item}.image}`:`unoptimized={${item}.image.startsWith("/api/notion-image/")}`);
  expect(source).not.toContain('fallbackProducts');
  expect(source).toContain('商品を読み込めませんでした');
 });
 it('the shared product photo bypasses the optimizer for the revocable image route, and both shop screens use it',()=>{
  const parts=readFileSync('src/features/shop/components/shop-catalog-parts.tsx','utf8');
  expect(parts.match(/<Image\s[\s\S]*?\/>/g)).toHaveLength(1);
  expect(parts).toContain('unoptimized={image.startsWith("/api/notion-image/")}');
  expect(parts).toContain('onError={onError}');
  for(const path of ['src/features/shop/components/ShopCatalog.tsx','src/features/shop/components/BeanCard.tsx','src/features/shop/components/BeanDetailModal.tsx','src/features/shop/components/CartDrawer.tsx']){
   const source=readFileSync(path,'utf8');expect(source,path).toContain('<ProductPhoto ');
   // Product photos only through ProductPhoto (ShopCatalog keeps its fixed /images photos).
   expect(source,path).not.toMatch(/src=\{(product|selectedProduct|item\.product|d\?)\.image/);
   if(!path.endsWith('ShopCatalog.tsx'))expect(source,path).not.toMatch(/<Image\s/);
  }
 });
});
