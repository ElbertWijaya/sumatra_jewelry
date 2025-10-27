"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
async function main() {
    const branchesToSeed = [
        { name: 'Asia', address: 'Jl. Asia No.170 B, Sei Rengas II, Kec. Medan Area, Kota Medan, Sumatera Utara 20211' },
        { name: 'Sun Plaza', address: 'Mall Jl. KH. Zainul Arifin No.7, Madras Hulu, Kec. Medan Polonia, Kota Medan, Sumatera Utara 20152' }
    ];
    for (const b of branchesToSeed) {
        const exists = await prisma.branch.findFirst({ where: { name: b.name } });
        if (!exists) {
            await prisma.branch.create({ data: b });
            console.log(`Branch seeded: ${b.name}`);
        }
    }
    const adminEmail = 'admin@tokomas.local';
    const defaultBranch = await prisma.branch.findFirst();
    if (!defaultBranch)
        throw new Error('Branch belum tersedia, hubungi admin.');
    const exists = await prisma.account.findUnique({ where: { email: adminEmail } });
    if (!exists) {
        const hash = await argon2.hash('Admin123!');
        await prisma.account.create({
            data: { email: adminEmail, fullName: 'Aceng', job_role: 'ADMINISTRATOR', password: hash, branch: { connect: { id: defaultBranch.id } } },
        });
        console.log('Seeded admin user: admin@tokomas.local / Admin123! (Aceng)');
    }
    else {
        if (exists.fullName !== 'Aceng') {
            await prisma.account.update({ where: { email: adminEmail }, data: { fullName: 'Aceng' } });
            console.log('Updated admin fullName to Aceng');
        }
        else {
            console.log('Admin user already exists.');
        }
    }
    const usersToSeed = [
        { email: 'sales@tokomas.local', fullName: 'Yanti', jobRole: 'SALES', phone: '081234567890', address: 'Jl. Asia No.170 B', branchIndex: 0 },
        { email: 'designer@tokomas.local', fullName: 'Elbert Wijaya', jobRole: 'DESIGNER', phone: '081234567891', address: 'Jl. Sun Plaza', branchIndex: 1 },
        { email: 'carver@tokomas.local', fullName: 'Acai', jobRole: 'CARVER', phone: '081234567892', address: 'Jl. Asia No.170 B', branchIndex: 0 },
        { email: 'caster@tokomas.local', fullName: 'Hanpin', jobRole: 'CASTER', phone: '081234567893', address: 'Jl. Sun Plaza', branchIndex: 1 },
        { email: 'diamond@tokomas.local', fullName: 'Yanti Atas', jobRole: 'DIAMOND_SETTER', phone: '081234567894', address: 'Jl. Asia No.170 B', branchIndex: 0 },
        { email: 'finisher@tokomas.local', fullName: 'Ayu', jobRole: 'FINISHER', phone: '081234567895', address: 'Jl. Sun Plaza', branchIndex: 1 },
        { email: 'inventory@tokomas.local', fullName: 'Suk Mai D', jobRole: 'INVENTORY', phone: '081234567896', address: 'Jl. Asia No.170 B', branchIndex: 0 },
    ];
    for (const u of usersToSeed) {
        const existU = await prisma.account.findUnique({ where: { email: u.email } });
        const branches = await prisma.branch.findMany({ orderBy: { id: 'asc' } });
        const branch = branches[u.branchIndex || 0];
        if (!existU) {
            const hash = await argon2.hash('Password123!');
            await prisma.account.create({
                data: {
                    email: u.email,
                    fullName: u.fullName,
                    job_role: u.jobRole || '',
                    password: hash,
                    phone: u.phone || null,
                    address: u.address || null,
                    branch: { connect: { id: branch.id } }
                }
            });
            console.log(`Seeded user: ${u.email} / Password123!`);
        }
        else {
            const updateData = {};
            if (u.jobRole && existU.job_role !== u.jobRole)
                updateData.job_role = u.jobRole;
            if (existU.fullName !== u.fullName)
                updateData.fullName = u.fullName;
            if (existU.phone !== u.phone)
                updateData.phone = u.phone;
            if (existU.address !== u.address)
                updateData.address = u.address;
            if (existU.branch_id !== branch.id)
                updateData.branch = { connect: { id: branch.id } };
            if (Object.keys(updateData).length) {
                await prisma.account.update({ where: { email: u.email }, data: updateData });
                console.log(`Updated user: ${u.email}`);
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