import { http } from "./http";

export interface CreatePurchaseItemInput {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface CreatePurchaseInput {
    accessKey?: string;
    invoiceNumber: string;
    issueDate: string;
    entryMethod: "MANUAL" | "SCANNED";
    supplierId: number;
    userId: number;
    items: CreatePurchaseItemInput[];
}

export interface Purchase {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    totalAmount: number;
    entryMethod: "MANUAL" | "SCANNED";
    supplierId: number;
    userId: number;
}

export function createPurchase(data: CreatePurchaseInput) {
    return http.post<Purchase>("/purchases", data).then((res) => res.data);
}