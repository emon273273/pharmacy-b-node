
const prisma = require("../../utils/prisma");
const getAllPermission = async (req, res) => {

    const role = req.user.roleId;

    const allpermission = await prisma.rolePermission.findMany({

        where: { roleId: role },
        include: {
            permission: {
                select: {
                    name: true
                }
            }

        }
    })

    const permissionNames = allpermission.map((name) => {

        return name.permission.name
    })
    console.log(permissionNames);





}


module.exports = { getAllPermission };