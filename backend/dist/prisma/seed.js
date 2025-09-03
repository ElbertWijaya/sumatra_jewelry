"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@tokomas.local';
    const exists = await prisma.appUser.findUnique({ where: { email: adminEmail } });
    if (!exists) {
        const hash = await argon2.hash('Admin123!');
        await prisma.appUser.create({
            data: { email: adminEmail, fullName: 'Admin', role: client_1.Role.admin, password: hash },
        });
        console.log('Seeded admin user: admin@tokomas.local / Admin123!');
    }
    else {
        console.log('Admin user already exists.');
    }
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map