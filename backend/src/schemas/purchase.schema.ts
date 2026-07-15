import { z } from "zod";

const createPurchaseItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
});

export const createPurchaseSchema = z.object({
    accessKey: z.string().length(44).optional(),
    invoiceNumber: z.string().min(1),
    issueDate: z.coerce.date(),
    entryMethod: z.enum(["MANUAL", "SCANNED"]),
    supplierId: z.number().int().positive(),
    userId: z.number().int().positive(),
    items: z.array(createPurchaseItemSchema).min(1),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export const listPurchasesQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    supplierId: z.coerce.number().int().positive().optional(),
    category: z.string().min(1).optional(),
});

export type ListPurchasesQuery = z.infer<typeof listPurchasesQuerySchema>;

export const updatePurchaseSchema = createPurchaseSchema; 