import { z } from "zod";
export const productPublicationSchema = z.object({
  candidateId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/), previewHash: z.string().regex(/^[a-f0-9]{64}$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  content: z.object({ name: z.string().max(10000), origin: z.string().max(10000), farm: z.string().max(10000), variety: z.string().max(10000), process: z.string().max(10000), description: z.string().max(10000) }).strict(),
}).strict();
export type ProductPublication = z.infer<typeof productPublicationSchema>;
/** Public responses deliberately exclude internal candidate IDs and evidence hashes. */
export const buyerProductPublicationSchema = productPublicationSchema.pick({ slug: true, content: true });
export type BuyerProductPublication = z.infer<typeof buyerProductPublicationSchema>;
export function buyerProductPublication(value: ProductPublication): BuyerProductPublication {
  return buyerProductPublicationSchema.parse({ slug: value.slug, content: value.content });
}
export const publicationAdoptionInput = z.object({
  requestId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/), candidateId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/),
  previewHash: z.string().regex(/^[a-f0-9]{64}$/), reference: z.string().trim().min(1).max(200), salesActivationConfirmed: z.literal(true),
}).strict();
