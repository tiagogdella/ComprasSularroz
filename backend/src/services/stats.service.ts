import { prisma } from "../lib/prisma.js";
import type { RangeStatsQuery } from "../schemas/stats.schema.js";

function endOfDay(date: Date) {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000 -1);
}

export async function getSpendingByPeriod(year: number) {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 999));

    const purchases = await prisma.purchase.findMany({
        where: { issueDate: { gte: start, lte: end }},
        select: { issueDate: true, totalAmount: true },
    });

    const totals = Array.from({ length: 12 }, () => 0);
    for (const purchase of purchases) {
        totals[purchase.issueDate.getUTCMonth()] += Number(purchase.totalAmount);
    }

    return totals.map((total, index) => ({ month: index + 1, total }));  
}

export async function getSpendingByCategory(filters: RangeStatsQuery) {
    const items = await prisma.purchaseItem.findMany({
        where: {
            purchase: {
                ...(filters.startDate || filters.endDate
                    ? {
                        issueDate: {
                            ...(filters.startDate ? { gte: filters.startDate } : {}),
                            ...(filters.endDate ? { lte: endOfDay(filters.endDate) } : {}),
                        },
                    }
                    : {}),
            },
        },
    include: { product: { select: {category: true } } },
    });

    const totalsByCategory = new Map<string, number> ();
    for (const item of items) {
        const current = totalsByCategory.get(item.product.category) ?? 0;
        totalsByCategory.set(item.product.category, current + Number(item.totalPrice));
    }

    return [...totalsByCategory.entries()]
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
}

export async function getSpendingBySupplier(filters: RangeStatsQuery) {
    const where = {
        ...(filters.startDate || filters.endDate
            ? {
                issueDate: {
                    ...(filters.startDate ? { gte: filters.startDate } : {}),
                    ...(filters.endDate ? { lte: endOfDay(filters.endDate) } : {}),
                },
            }
            : {}),
    };

    const grouped = await prisma.purchase.groupBy({
        by: ["supplierId"],
        where,
        _sum: { totalAmount: true },
    });

    const suppliers = await prisma.supplier.findMany({
        where: { id: { in: grouped.map((g) => g.supplierId) } },
        select: { id: true, name: true },
    });
    const nameById = new Map(suppliers.map((s) => [s.id, s.name]));

    return grouped 
        .map((g) => ({
            supplierId: g.supplierId,
            supplierName: nameById.get(g.supplierId) ?? "",
            total: Number(g._sum.totalAmount ?? 0),
        }))
        .sort((a, b) => b.total - a.total);
}