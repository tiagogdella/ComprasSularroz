import type { Request, Response } from "express";
import { createPurchaseSchema, listPurchasesQuerySchema, updatePurchaseSchema } from "../schemas/purchase.schema.js";
import * as purchaseService from "../services/purchase.service.js";
import type { REPLCommand } from "node:repl";

export async function create(req: Request, res: Response) {
    const parsed = createPurchaseSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const purchase = await purchaseService.createPurchase(parsed.data);
    res.status(201).json(purchase);
}

export async function list(req: Request, res: Response) {
    const parsed = listPurchasesQuerySchema.safeParse(req.query);
    if(!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const result = await purchaseService.listPurchases(parsed.data);
    res.json(result);
}

export async function getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const purchase = await purchaseService.getPurchaseById(id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parsed = updatePurchaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const purchase = await purchaseService.updatePurchase(id, parsed.data);
    res.json(purchase);
}

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await purchaseService.deletePurchase(id);
    res.status(204).send();
}