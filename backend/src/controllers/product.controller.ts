import type { Request, Response } from "express";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import * as productService from "../services/product.service.js";

export async function list(req: Request, res: Response) {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const products = await productService.listProducts(search);
    res.json(products);
}

export async function getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ message: "product not found" });
    res.json(product);
}

export async function create(req: Request, res: Response) {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const product = await productService.createProduct(parsed.data)
    res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const product = await productService.updateProduct(id, parsed.data);
    res.json(product);
}

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);
    res.status(204).send();
}
