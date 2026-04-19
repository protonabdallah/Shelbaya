const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");

const DEFAULT_DATABASE_URL = "file:./dev.db";

function resolveDatabaseUrl() {
  const rawUrl = (process.env.DATABASE_URL || DEFAULT_DATABASE_URL).trim();

  if (!rawUrl.startsWith("file:")) {
    return rawUrl;
  }

  const filePath = rawUrl.slice("file:".length);
  if (!filePath || filePath === ":memory:") {
    return rawUrl;
  }

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  return `file:${absolutePath}`;
}

const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

const admins = [
  {
    username: "admin",
    password: "$2b$10$SLir2JaZi6HnXncNBlH.q.d.JPQPwEGzas.DPE7nz5P6NC7ZWz69y",
  },
];

const products = [
  {
    name: "test",
    nameAr: "test",
    description:
      "test\nTEst\nqwfrgWEQAF\nGHSRFGEG grdfeasgaeghsg efsdf\nEfaweghrhdrg\nAeghhesfsedf\nefsfghrfgd\n\n",
    descriptionAr: "test\n324324\nrdydrfs",
    price: 12312,
    oldPrice: 1323,
    stock: 5,
    category: "desktops",
    brand: "32424",
    images: JSON.stringify(["/uploads/1776624466725-zv8hjr.jpg"]),
    featured: false,
    published: true,
    createdAt: new Date("2026-04-19T18:47:47.824Z"),
    updatedAt: new Date("2026-04-19T19:54:23.191Z"),
  },
];

async function main() {
  for (const admin of admins) {
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: admin.username },
    });

    if (!existingAdmin) {
      await prisma.admin.create({ data: admin });
    }
  }

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: product.name,
        category: product.category,
      },
    });

    if (!existingProduct) {
      await prisma.product.create({ data: product });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
