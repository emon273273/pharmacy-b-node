const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()


const bcrypt = require('bcrypt');
const saltRounds = 10;

const endPoints = [

    'user'
]


const permissionTypes = ["create", "readAll", "readSingle", "update", "delete"];


const permissions = endPoints.reduce((acc, curr) => {

    const permission = permissionTypes.map((type) => {

        return `${type}-${curr}`
    })

    return [...acc, ...permission]
}, []);


const roles = ["admin", "operator"]


async function main() {

       //create role

    await prisma.Role.createMany({

        data: roles.map((role) => {

            return {

                name: role
            }
        })
    })


    //create admin user info
    await prisma.user.create({

        data: {
            email: "admin@gmail.com",
            password: await bcrypt.hash("admin123", saltRounds),
            roleId: 1

        }
    })


    await prisma.Permission.createMany({

        data: permissions.map((permission) => {

            return {

                name: permission
            }
        })
    })

 
    // role permission

    for (let i = 1; i <= permissions.length; i++) {

        await prisma.RolePermission.createMany({

            data: {
                roleId: 1,
                permissionId: i
            }
        })
    }
}

main()
    .then(async () => {

        await prisma.$disconnect();
    })
    .catch(async (e) => {

        console.log(e);

        await prisma.$disconnect()

        process.exit(1)
    });