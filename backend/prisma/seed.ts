import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

const users = [
    { name: "Administrador", login: "admin", password: "admin123" },
    { name: "Tiago", login: "tiago", password: "tiago123" },
    { name: "Ramos", login: "ramos", password: "ramos123" },
    { name: "Joel", login: "joel", password: "joel123" },
    { name: "Miro", login: "miro", password: "miro123" },
    { name: "Joao", login: "joao", password: "joao123" },
    { name: "Beto", login: "beto", password: "beto123" },
];

async function main() {
    // upsert em vez de deleteMany + create: usuários com compras reais vinculadas
    // (Purchase.userId) não podem mais ser apagados (constraint de FK) desde que o sistema
    // passou a ter uso real - e também não faz sentido tentar. Isso só cria quem ainda não
    // existe e atualiza nome/senha de quem já existe, sem remover ninguém.
    await Promise.all(
        users.map(async (u) => {
            const passwordHash = await bcrypt.hash(u.password, 10);
            return prisma.user.upsert({
                where: { login: u.login },
                update: { name: u.name, passwordHash },
                create: { name: u.name, login: u.login, passwordHash },
            });
        })
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
