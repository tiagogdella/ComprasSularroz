import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authenticate(req: Request, res: Response, next: NextFunction ) {
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer ")) {
        throw new AppError(401, "Missing or invalid Authorization header");
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = payload.userId;
        next();
    } catch {
        throw new AppError(401, "Invalid or expired token");
    }
}