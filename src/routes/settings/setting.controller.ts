import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getAllPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // get role id from req.user
    const role = req.user?.roleId;

    if (!role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // fetch all permission from rolePermission table
    const allpermission = await prisma.rolePermission.findMany({
      where: { roleId: role },
      include: {
        permission: {
          select: {
            name: true,
          },
        },
      },
    });

    // convert into array of string
    const permissionNames = allpermission.map((item) => {
      return item.permission.name;
    });

    res.status(200).json({
      message: "All permission",
      data: permissionNames,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Get Permission Error:", err.message);
    res.status(500).json({
      message: "An error occurred while fetching permissions",
    });
  }
};

interface UpdatePermissionBody {
  role: number;
  permissionId: number[];
}

export const updateOtherPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // only admin can update other permission
    const Adminrole = req.user?.roleId;
    if (Adminrole !== 1) {
      res.status(403).json({
        message: "Only admin can update other permission",
      });
      return;
    }

    const { role, permissionId } = req.body as UpdatePermissionBody;

    // prepare the data for bulk insert
    const newPermission = permissionId.map((id) => {
      return {
        roleId: role,
        permissionId: id,
      };
    });

    // transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId: role,
        },
      });

      // create many with skip duplicate true
      const result = await tx.rolePermission.createMany({
        data: newPermission,
        skipDuplicates: true,
      });

      res.status(200).json({
        message: "Other permission updated successfully",
        data: result,
      });
    });
  } catch (error) {
    const err = error as Error;
    console.error("Transaction Error:", err.message);
    res.status(500).json({
      message: "An error occurred while updating permissions",
    });
  }
};
