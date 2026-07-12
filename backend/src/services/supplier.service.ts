import { prisma } from "../lib/prisma.js";
import type { CreateSupplierInput, UpdateSupplierInput } from "../schemas/supplier.schema.js";

export function listSuppliers() {
    return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}

export function getSupplierById(id: number) {
    return prisma.supplier.findUnique({ where: { id } });
}

export function createSupplier(data: CreateSupplierInput) {
    return prisma.supplier.create({ data });
}

export function updateSupplier(id: number, data: UpdateSupplierInput) {
    return prisma.supplier.update({ where: { id }, data });
}
 
export function deleteSupplier(id: number) {
    return prisma.supplier.delete({ where: { id } });
}