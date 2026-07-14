import { prisma } from "../lib/prisma.js";
import type { CreatePurchaseInput, ListPurchasesQuery } from "../schemas/purchase.schema.js";

export async function listPurchases(filters: ListPurchasesQuery) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const where = {
        ...(filters.supplierId ? { supplierId: filters.supplierId } : {}),
        ...(filters.startDate || filters.endDate
            ? {
                  issueDate: {
                      ...(filters.startDate ? { gte: filters.startDate } : {}),
                      ...(filters.endDate ? { lte: filters.endDate } : {}),
                  },
              }
            : {}),
        ...(filters.category
            ? { items: { some: { product: { category: filters.category } } } }
            : {}),
    };

    const [data, total] = await Promise.all([
        prisma.purchase.findMany({
            where,
            orderBy: { issueDate: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { supplier: true },
        }),
        prisma.purchase.count({ where }),
    ]);

    return {
        data,
        meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
}

export function getPurchaseById(id: number) {
    return prisma.purchase.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            supplier: true,
            user: true,
        },
    });
}

function round2(value: number) {
    return Math.round(value * 100) / 100;
}

export function createPurchase(data: CreatePurchaseInput) {
    const items = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: round2(item.quantity * item.unitPrice),
    }))
    
    const totalAmount = round2(items.reduce((sum, item) => sum + item.totalPrice, 0));

    return prisma.purchase.create({
        data: {
            accessKey: data.accessKey,
            invoiceNumber: data.invoiceNumber,
            issueDate: data.issueDate,
            entryMethod: data.entryMethod,
            totalAmount,
            supplierId: data.supplierId,
            userId: data.userId,
            items: {
                create: items,
            },
        },
        include: { items: true },
    });
}

