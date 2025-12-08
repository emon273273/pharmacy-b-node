const prisma = require("../../utils/prisma");
const { createMedicineSchema } = require("../../utils/schema/createMedicineSchema");



const createMedicine = async (req, res) => {
    try {
        // 1️⃣ Validate input
        const parsed = createMedicineSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: "Validation Error",
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        // 2️⃣ Save to database
        const medicine = await prisma.medicine.create({
            data: {
                medicineName: data.medicineName,
                genericName: data.genericName,
                brandName: data.brandName,
                description: data.description,

                dosageType: data.dosageType,
                unitType: data.unitType,

                reorderLevel: data.reorderLevel ?? 0,

                categoryId: data.categoryId,
                supplierId: data.supplierId,

                // Create batch records
                batches: {
                    create: data.batches.map((b) => ({
                        batchNumber: b.batchNumber,
                        quantity: b.quantity,
                        manufacturingDate: b.manufacturingDate
                            ? new Date(b.manufacturingDate)
                            : null,
                        expiryDate: new Date(b.expiryDate),
                        purchasePrice: b.purchasePrice,
                        sellingPrice: b.sellingPrice,
                    })),
                },
            },
            include: {
                batches: true,
                category: true,
                supplier: true,
            },
        });

        return res.status(201).json({
            message: "Medicine created successfully",
            createdMedicine: medicine,
        });
    } catch (err) {
        console.error("Create Medicine Error:", err);

        return res.status(500).json({
            status: false,
            message: "Server error",
            error: err.message,
        });
    }
};

const getAllMedicine = async (req, res) => {
    try {
        const medicines = await prisma.medicine.findMany({
            include: {
                batches: true,
                category: true,
                supplier: true,
            },
        });

        return res.status(200).json({
            message: "Medicines retrieved successfully",
            medicines,
        });
    } catch (err) {
        console.error("Get All Medicines Error:", err);

        return res.status(500).json({
            status: false,
            message: "Server error",
            error: err.message,
        });
    }
};

module.exports = { createMedicine,getAllMedicine };
