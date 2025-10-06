const jwt = require("jsonwebtoken");
function protectedRoutes(req, res, next) {

    const authHeader = req.headers.authorization;

   

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).send({
            message: "Authorization requireed"
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { roleId: decoded.roleId };

        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).send({
            message: "Invalid or expired token"
        })
    }
}

module.exports = protectedRoutes;


