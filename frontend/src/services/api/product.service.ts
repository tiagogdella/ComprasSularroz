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