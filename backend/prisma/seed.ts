import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const img = (name: string) => `/uploads/${name}.jpg`;

// Seed photos are committed under prisma/seed-assets and copied into the
// (git-ignored) uploads/ folder that the API serves statically.
function copySeedImages() {
    const srcDir = path.join(__dirname, "seed-assets");
    const destDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    if (!fs.existsSync(srcDir)) return;
    for (const file of fs.readdirSync(srcDir)) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
}

const CARS = [
    { name: "Range Rover Evoque", bodyType: "SUV فاخر", year: 2022, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 18000, image: img("evoque") },
    { name: "BMW X3", bodyType: "SUV فاخر", year: 2023, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 16000, image: img("x3") },
    { name: "Audi Q5", bodyType: "SUV فاخر", year: 2022, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 15000, image: img("q5") },
    { name: "Volkswagen Tiguan", bodyType: "SUV عائلي", year: 2023, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 11000, image: img("tiguan") },
    { name: "Hyundai Tucson", bodyType: "SUV عائلي", year: 2022, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 10000, image: img("tucson") },
    { name: "Volkswagen T-Roc", bodyType: "SUV مدمج", year: 2023, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 9000, image: img("troc") },
    { name: "Volkswagen Golf 8", bodyType: "هاتشباك", year: 2022, fuel: "بنزين", transmission: "أوتوماتيك", seats: 5, pricePerDay: 7500, image: img("golf") },
    { name: "Dacia Duster", bodyType: "SUV اقتصادي", year: 2022, fuel: "ديزل", transmission: "يدوي", seats: 5, pricePerDay: 6500, image: img("duster") },
];

const SALES = [
    { title: "Volkswagen Tiguan 2020", brand: "Volkswagen", model: "Tiguan", year: 2020, price: 4800000, km: 52000, fuel: "بنزين", gearbox: "أوتوماتيك", color: "أبيض", phone: "0555 12 34 56", wilaya: "الجزائر العاصمة", description: "سيارة بحالة ممتازة، صيانة دورية بالوكالة، إطارات جديدة، لا تحتاج أي مصاريف.", images: [img("tiguan")], sold: false },
    { title: "Volkswagen Golf 8 2021", brand: "Volkswagen", model: "Golf 8", year: 2021, price: 4200000, km: 31000, fuel: "بنزين", gearbox: "أوتوماتيك", color: "رمادي", phone: "0661 22 33 44", wilaya: "وهران", description: "قولف 8 نسخة كاملة، شاشة رقمية، حالة الوكالة، أول مالك.", images: [img("golf")], sold: false },
    { title: "BMW X3 xDrive 2020", brand: "BMW", model: "X3", year: 2020, price: 9500000, km: 48000, fuel: "بنزين", gearbox: "أوتوماتيك", color: "أزرق", phone: "0770 55 66 77", wilaya: "قسنطينة", description: "BMW X3 دفع رباعي، تجهيزات كاملة، مقاعد جلد، فتحة سقف بانورامية.", images: [img("x3")], sold: false },
    { title: "Dacia Duster 2019", brand: "Dacia", model: "Duster", year: 2019, price: 2700000, km: 73000, fuel: "ديزل", gearbox: "يدوي", color: "بني", phone: "0555 88 99 00", wilaya: "سطيف", description: "داسيا داستر ديزل اقتصادية، مناسبة للطرقات، صيانة حديثة.", images: [img("duster")], sold: true },
    { title: "Hyundai Tucson 2021", brand: "Hyundai", model: "Tucson", year: 2021, price: 4600000, km: 38000, fuel: "بنزين", gearbox: "أوتوماتيك", color: "أبيض", phone: "0661 11 22 33", wilaya: "عنابة", description: "توسان الجيل الجديد، تصميم عصري، حالة ممتازة، فل أوبسيون.", images: [img("tucson")], sold: false },
    { title: "Audi Q5 2019", brand: "Audi", model: "Q5", year: 2019, price: 7800000, km: 56000, fuel: "بنزين", gearbox: "أوتوماتيك", color: "فضي", phone: "0770 44 55 66", wilaya: "البليدة", description: "أودي Q5 كواترو، فل أوبسيون، صيانة بالوكالة، بحالة الجديدة.", images: [img("q5")], sold: false },
];

async function main() {
    copySeedImages();

    if (process.env.SEED_RESET === "true") {
        await prisma.booking.deleteMany();
        await prisma.car.deleteMany();
        await prisma.saleListing.deleteMany();
        await prisma.storeSettings.deleteMany();
        await prisma.user.deleteMany();
        await prisma.agency.deleteMany();
    }

    // Platform super-admin (no agency).
    const superEmail = (process.env.SUPER_EMAIL || "super@mastercars.dz").toLowerCase();
    if (!(await prisma.user.findUnique({ where: { email: superEmail } }))) {
        const password = await bcrypt.hash(process.env.SUPER_PASSWORD || "super123", 10);
        await prisma.user.create({ data: { name: "مدير المنصة", email: superEmail, password, role: "SUPER_ADMIN" } });
    }

    // Demo agency (tenant) + its owner + demo data.
    let agency = await prisma.agency.findUnique({ where: { slug: "master-cars" } });
    if (!agency) {
        agency = await prisma.agency.create({
            data: { name: "Master Cars", slug: "master-cars", city: "الجزائر", phone: "05 00 00 00 00", rentalsEnabled: true, salesEnabled: true },
        });
    }

    const ownerEmail = (process.env.ADMIN_EMAIL || "admin@mastercars.dz").toLowerCase();
    if (!(await prisma.user.findUnique({ where: { email: ownerEmail } }))) {
        const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
        await prisma.user.create({ data: { name: "مالك الوكالة", email: ownerEmail, password, role: "OWNER", agencyId: agency.id } });
    }

    if ((await prisma.car.count({ where: { agencyId: agency.id } })) === 0)
        await prisma.car.createMany({ data: CARS.map((c) => ({ ...c, agencyId: agency!.id })) });
    if ((await prisma.saleListing.count({ where: { agencyId: agency.id } })) === 0)
        await prisma.saleListing.createMany({ data: SALES.map((s) => ({ ...s, agencyId: agency!.id })) });

    await prisma.storeSettings.upsert({ where: { agencyId: agency.id }, update: {}, create: { agencyId: agency.id } });

    console.log("Seed complete. Super-admin: %s | Demo agency: master-cars (owner %s)", superEmail, ownerEmail);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
