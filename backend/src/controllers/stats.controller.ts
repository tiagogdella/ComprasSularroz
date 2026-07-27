import type { Request, Response } from "express";
import { periodStatsQuerySchema, rangeStatsQuerySchema } from "../schemas/stats.schema.js";
import * as statsService from "../services/stats.service.js";

export async function byPeriod(req: Request, res: Response) {
    const parsed = periodStatsQuerySchema.safeParse(req.query);
    if(!parsed.success) return res.status(400).json({ message: parsed.error.message });
    
    const result = await statsService.getSpendingByPeriod(parsed.data.year);
    res.json(result);
}

export async function byCategory(req: Request, res: Response) {
    const parsed = rangeStatsQuerySchema.safeParse(req.query);
    if(!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const result = await statsService.getSpendingByCategory(parsed.data);
    res.json(result);
}

export async function bySupplier(req: Request, res: Response) {
    const parsed = rangeStatsQuerySchema.safeParse(req.query);
    if(!parsed.success) return res.status(400).json({ Message: parsed.error.message });

    const result = await statsService.getSpendingBySupplier(parsed.data);
    res.json(result);
}