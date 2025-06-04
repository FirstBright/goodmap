// scripts/create-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function createAdmin() {
  const email = "mipo8890@gmail.com"; // 원하는 이메일
  const password = "rlacjftjd1!"; // 원하는 비밀번호
  const saltRounds = 10;

  try {
    // 이미 존재하는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      return;
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 어드민 유저 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log(`Admin user created successfully: ${user.email}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
