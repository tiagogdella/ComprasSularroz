import bcrypt from "bcryptjs";
import  Jwt  from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";
import type { LoginInput } from "../schemas/auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { login: data.login } });
    if (!user) throw new AppError(401, "Invalid login or password");

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) throw new AppError(401, "Invalid login or password");

    const token = Jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "8h" });

    return { token, user: { id: user.id, name: user.name, login: user.login } };
}