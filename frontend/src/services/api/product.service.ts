import { http } from "./http";

export interface Product {
    id: number,
    name: string,
    category: string,
    unit: string,
    specification: string,
}

export interface CreateProductInput {
    name: string,
    category: string,
    unit: string,
    specification: string,
}

export function listProducts(search?: string) {
    return http.get<Product[]>("/products", { params: search ? { search } : undefined }).then((res) => res.data);
}

export function createProduct(data: CreateProductInput) {
    return http.post<Product>("/products", data).then((res) => res.data);
}

export interface ProductHistorySupplier {
    id: number;
    name: string;
}

export interface ProductHistoryPurchase {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    supplier: ProductHistorySupplier;
}

export interface ProductHistoryItem {
    id: number;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
    purchase: ProductHistoryPurchase;
}

export interface ProductHistoryResponse {
    product: Product;
    history: ProductHistoryItem[];
}

export function getProductHistory(id: number) {
    return http.get<ProductHistoryResponse>(`/products/${id}/history`).then((res) => res.data);
}