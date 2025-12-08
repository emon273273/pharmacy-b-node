const prisma = require("../../utils/prisma");

const createCategory = async (req, res) => {

    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: "Name is required" });
        }

        const category = await prisma.category.create({
            data: { name }
        });

        return res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}


module.exports = { createCategory };
