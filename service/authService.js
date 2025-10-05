const { PrismaClient } = require("@prisma/client")

const bcrypt = require('bcrypt');

const prisma = new PrismaClient();



const login = async (email, password) => {



    const user = await prisma.user.findUnique({

        where: { email },


    })

    console.log(user);

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
        roleId: user.roleId
    };
}


module.exports = { login };