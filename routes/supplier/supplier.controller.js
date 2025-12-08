const prisma = require("../../utils/prisma");
const createSupplier = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: "Name is required" });
        }

        const supplier = await prisma.supplier.create({
            data: { name, email, phone, address }
        });


        res.status(201).json({
            message: "Supplier created successfully",
            supplier
        });


    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}





module.exports = { createSupplier };
