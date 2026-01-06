import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface LoginResult {
  id: number;
  email: string;
  roleId: number | null;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  return {
    id: user.id,
    email: user.email,
    roleId: user.roleId,
  };
};
