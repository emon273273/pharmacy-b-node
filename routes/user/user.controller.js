const { login } = require("../../service/authService");
const jsonWebToken = require("jsonwebtoken");


const LoginUser = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await login(email, password);


    const token = jsonWebToken.sign({
        id: user.id,
        email: user.email,
        roleId: user.roleId
    }, process.env.JWT_SECRET, {
        expiresIn: '1d'

    })


    res.status(200).json({
        message: "Login successful",
        user,
        token
    });


}


module.exports = { LoginUser };