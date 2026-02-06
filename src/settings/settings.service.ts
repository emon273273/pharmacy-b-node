import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPermissions(roleId: number): Promise<string[]> {
    const allPermission = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            name: true,
          },
        },
      },
    });

    return allPermission.map((item) => item.permission.name);
  }

  async updateOtherPermission(roleId: number, permissionIds: number[]) {
    const newPermission = permissionIds.map((id) => ({
      roleId,
      permissionId: id,
    }));

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      const result = await tx.rolePermission.createMany({
        data: newPermission,
        skipDuplicates: true,
      });

      return result;
    });
  }
}
