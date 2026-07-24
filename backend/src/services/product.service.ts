import { prisma } from "../lib/prisma.js";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema.js";

export function listProducts(search?: string) {
    return prisma.product.findMany({
        where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
        orderBy: { name: "asc" },
    });
}

export function getProductById(id: number) {
    return prisma.product.findUnique({ where: { id } });
}

export function createProduct(data: CreateProductInput) {
    return prisma.product.create({ data });
}

export function updateProduct(id: number, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data });
}

export function deleteProduct(id: number) {
    return prisma.product.delete({ where: { id } });
}

export function getProductHistory(productId: number) {
    return prisma.purchaseItem.findMany({
        where: { productId },
        include: {
            purchase: {
                include: { supplier: true },
            },
        },
        orderBy: { purchase: { issueDate: "desc" } },
    });
}
