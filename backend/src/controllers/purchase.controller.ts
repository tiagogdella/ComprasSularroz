import type { Request, Response } from "express";
import { createPurchaseSchema } from "../schemas/purchase.schema.js";
import * as purchaseService from "../services/purchase.service.js";

export async function create(req: Request, res: Response) {
    const parsed = createPurchaseSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const purchase = await purchaseService.createPurchase(parsed.data);
    res.status(201).json(purchase);
}