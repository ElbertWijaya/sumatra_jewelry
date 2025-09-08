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
    const usersToSeed = [
        { email: 'sales@tokomas.local', fullName: 'Sales', role: client_1.Role.kasir },
        { email: 'designer@tokomas.local', fullName: 'Designer', role: client_1.Role.pengrajin, jobRole: 'DESIGNER' },
        { email: 'carver@tokomas.local', fullName: 'Carver', role: client_1.Role.pengrajin, jobRole: 'CARVER' },
        { email: 'caster@tokomas.local', fullName: 'Caster', role: client_1.Role.pengrajin, jobRole: 'CASTER' },
        { email: 'diamond@tokomas.local', fullName: 'Diamond Setter', role: client_1.Role.pengrajin, jobRole: 'DIAMOND_SETTER' },
        { email: 'finisher@tokomas.local', fullName: 'Finisher', role: client_1.Role.pengrajin, jobRole: 'FINISHER' },
        { email: 'inventory@tokomas.local', fullName: 'Inventory', role: client_1.Role.kasir, jobRole: 'INVENTORY' },
    ];
    for (const u of usersToSeed) {
        const existU = await prisma.appUser.findUnique({ where: { email: u.email } });
        if (!existU) {
            const hash = await argon2.hash('Password123!');
            await prisma.appUser.create({ data: { email: u.email, fullName: u.fullName, role: u.role, jobRole: u.jobRole, password: hash } });
            console.log(`Seeded user: ${u.email} / Password123!`);
        }
        else {
            if (u.jobRole && existU.jobRole !== u.jobRole) {
                await prisma.appUser.update({ where: { email: u.email }, data: { jobRole: u.jobRole } });
                console.log(`Updated jobRole for ${u.email} -> ${u.jobRole}`);
            }
        }
    }
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map