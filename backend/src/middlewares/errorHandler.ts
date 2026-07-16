import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
    P2002: { status: 409, message: "Resource already exists (duplicate value)" },
    P2025: { status: 404, message: "Resource not found" },
    P2003: { status: 409, message: "Operation violates a related record (foreign key constraint)" },
};

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    if (err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400) {
        res.status(400).json({ message: "Invalid JSON body" });
        return
    }

    const prismaCode = (err as { code?: string })?.code;
    const prismaError = prismaCode ? PRISMA_ERRORS[prismaCode] : undefined;

    if (prismaError) {
        res.status(prismaError.status).json({ message: prismaError.message });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
}
