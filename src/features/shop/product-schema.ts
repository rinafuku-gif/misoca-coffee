import {z} from 'zod';

/** Public catalog only. A reference price is not an order price or stock. */
export const ProductSchema=z.object({
 id:z.string(),name:z.string(),origin:z.string(),roast:z.string(),flavor:z.string(),
 price:z.number().finite().nonnegative().nullable(),unit:z.string(),image:z.string(),inStock:z.boolean(),
 process:z.string(),variety:z.string(),region:z.string(),farm:z.string(),altitude:z.string(),description:z.string(),
 priceIsReference:z.literal(true).optional(),
});
export type Product=z.infer<typeof ProductSchema>;
export const canPurchaseCatalogProduct=(product:Product):product is Product&{price:number}=>
 !product.priceIsReference&&product.inStock&&typeof product.price==='number'&&Number.isSafeInteger(product.price)&&product.price>0;
export const catalogPriceLabel=(product:Product)=>product.price===null?'価格未設定':`${product.priceIsReference?'参考価格 ':''}¥${product.price.toLocaleString('ja-JP')}`;
