import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';

describe('every public consumer respects revocable media and nullable reference prices',()=>{
 it.each(['src/app/page.tsx','src/app/blog/page.tsx','src/app/blog/[id]/page.tsx'])('article cover bypasses optimizer in %s',path=>{
  const source=readFileSync(path,'utf8'),covers=[...source.matchAll(/<Image\s[\s\S]*?\/>/g)].filter(m=>m[0].includes('src={post.coverImage}'));
  expect(covers).toHaveLength(1);
  expect(covers[0][0]).toContain('unoptimized={post.coverImage.startsWith("/api/notion-image/")}');
 });
 it.each([['src/app/page.tsx','item'],['src/app/shop/page.tsx','product']])('public catalog validates API and does not invent fallback rows in %s',(path,item)=>{
  const source=readFileSync(path,'utf8');
  expect(source).toContain('ProductSchema.array().max(500).safeParse');
  expect(source).toContain(`catalogPriceLabel(${item})`);
  expect(source).toContain(`unoptimized={${item}.image.startsWith("/api/notion-image/")}`);
  expect(source).not.toContain('fallbackProducts');
  expect(source).toContain('商品を読み込めませんでした');
 });
});
