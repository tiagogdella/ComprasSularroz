import { prisma } from "../lib/prisma.js";
import type { CreatePurchaseInput } from "../schemas/purchase.schema.js";

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

