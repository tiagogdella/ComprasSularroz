import { z } from "zod";

export const suggestCategorySchema = z.object({
    description: z.string().min(1),
});

export const priceReportSchema = z.object({
    productId: z.number().int().positive().optional(),
    description: z.string().min(1),
    paidPrice: z.number().positive(),
});

