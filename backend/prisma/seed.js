const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "teacher1" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username: "teacher1",
        password: bcrypt.hashSync("teacher123", 10),
        role: "teacher",
        fullName: "อาจารย์ตัวอย่าง",
      },
    });
    console.log("Seeded teacher1 / teacher123");
  } else {
    console.log("teacher1 already exists");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
