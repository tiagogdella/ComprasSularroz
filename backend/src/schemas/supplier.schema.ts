import { z } from "zod";

export const createSupplierSchema = z.object({
    name: z.string().min(1),
    taxId: z.string().min(1),
    contact: z.string().min(1).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
