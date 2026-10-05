import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const industries = [
  "IT・Web",
  "製造",
  "建設",
  "不動産",
  "金融",
  "保険",
  "人材",
  "広告・マーケティング",
  "小売",
  "飲食",
  "医療",
  "福祉",
  "教育",
  "運輸",
  "その他",
];

async function main() {
  for (const name of industries) {
    await prisma.industry.upsert({
      where: { name },
      update: { isActive: true },
      create: { name },
    });
  }

  await prisma.event.upsert({
    where: { slug: "crossover-demo" },
    update: {},
    create: {
      name: "クロスオーバー企業交流会 Demo",
      eventDate: new Date("2026-11-01T10:00:00+09:00"),
      venue: "犬山市",
      description: "企業プロフィール登録・検索を確認するためのデモ交流会です。",
      slug: "crossover-demo",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
