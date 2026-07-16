import type { Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";
import { AppError } from "../errors/AppError.js";

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const result = await authService.login(parsed.data);
    res.json(result);
}