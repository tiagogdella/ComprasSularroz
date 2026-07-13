import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    unit: z.string().min(1),
    specification: z.string().min(1).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
