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

export interface PurchaseListItemProduct {
    id: number;
    name: string;
    category: string;
}

export interface PurchaseListItemEntry {
    id: number;
    productId: number;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    product: PurchaseListItemProduct;
}

export interface PurchaseListItem {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    totalAmount: string;
    entryMethod: "MANUAL" | "SCANNED";
    supplier: { id: number; name: string; taxId: string; contact: string | null };
    user: { id: number; name: string };
    items: PurchaseListItemEntry[];
}

export interface ListPurchasesParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    supplierId?: number;
    category?: string;
    productId?: number;
}

export interface ListPurchasesResponse {
    data: PurchaseListItem[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export function listPurchases(params: ListPurchasesParams) {
    return http.get<ListPurchasesResponse>("/purchases", { params }).then((res) => res.data);
}
