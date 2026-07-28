import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {

    // clean before it seeds
    await prisma.user.deleteMany();

   await Promise.all([
        prisma.user.create({ data: { name: "Administrador", login: "admin", passwordHash: await bcrypt.hash("admin123", 10) } }),
        prisma.user.create({ data: { name: "Tiago", login: "tiago", passwordHash: await bcrypt.hash("tiago123", 10) } }),
        prisma.user.create({ data: { name: "Ramos", login: "ramos", passwordHash: await bcrypt.hash("ramos123", 10) } }),
        prisma.user.create({ data: { name: "Joel", login: "joel", passwordHash: await bcrypt.hash("joel123", 10) } }),
        prisma.user.create({ data: { name: "Miro", login: "miro", passwordHash: await bcrypt.hash("miro123", 10) } }),
    ]); 
}

main() 
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
