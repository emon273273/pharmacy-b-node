const prisma = require("../../utils/prisma");
const getAllPermission = async (req, res) => {
    // get role id from req.user
    const role = req.user.roleId;

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
    const permissionNames = allpermission.map((name) => {
        return name.permission.name;
    });

    res.status(200).json({
        message: "All permission",
        data: permissionNames,
    });
};




const updateOtherPermission = async (req, res) => {


    // only admin can update other permission
    const Adminrole = req.user.roleId;
    if (Adminrole !== 1) {
        return res.status(403).json({
            message: "Only admin can update other permission",
        });
    }


    const { role, permissionId } = req.body;



    //prepare the data for bulk insert because createmany hasn't where condition so i have to make  a array of object  Like : 

    //     [
    //   { roleId: 2, permissionId: 1 },
    //   { roleId: 2, permissionId: 2 },
    //   { roleId: 2, permissionId: 3 }
    // ]
    const newPermission = permissionId.map((id) => {
        return {
            roleId: role,
            permissionId: id,
        };
    });

    // try catch block for transaction
    try {

        // delete first all the permission of that role and then create new permission
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
        console.error("Transaction Error:", error);
        res.status(500).json({
            message: "An error occurred while updating permissions",
        });
    }
};

module.exports = { getAllPermission, updateOtherPermission };
