import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const saltRounds = 10;

const endPoints = ["user", "medicine"];

const permissionTypes = ["create", "readAll", "readSingle", "update", "delete"];

const permissions = endPoints.reduce<string[]>((acc, curr) => {
  const permission = permissionTypes.map((type) => {
    return `${type}-${curr}`;
  });

  return [...acc, ...permission];
}, []);

const roles = ["admin", "operator"];

async function main() {
  // Create default branch
  await prisma.branch.create({
    data: {
      name: "Main Branch",
      address: "123 Main Street",
      phone: "+8801712345678",
      email: "main@pharmacy.com",
      isActive: true,
    },
  });

  // create role
  await prisma.role.createMany({
    data: roles.map((role) => {
      return {
        name: role,
      };
    }),
  });

  // create admin user info
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin123", saltRounds),
      roleId: 1,
      fullName: "Admin User",
      branchId: 1, // Assign to Main Branch
    },
  });

  await prisma.permission.createMany({
    data: permissions.map((permission) => {
      return {
        name: permission,
      };
    }),
  });

  // role permission
  for (let i = 1; i <= permissions.length; i++) {
    await prisma.rolePermission.createMany({
      data: {
        roleId: 1,
        permissionId: i,
      },
    });

    if (i === 2 || i === 3) {
      await prisma.rolePermission.create({
        data: {
          roleId: 2,
          permissionId: i,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);

    await prisma.$disconnect();

    process.exit(1);
  });
