const getPagination = require("../../utils/paginateQuery");
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

        //create medicine with batches
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

        if (req.query.query === "all") {
            const medicines = await prisma.medicine.findMany({
                orderBy: { id: "desc" },
                include: {
                    category: true,
                    supplier: true,
                    batches: true,
                }
            });


            return res.status(200).json(medicines);
        }


        else if (req.query.query === "search") {
            const { skip, limit } = getPagination(req.query);

            const medicines = await prisma.medicine.findMany({
                orderBy: { id: "desc" },
                where: {
                    OR: [
                        { medicineName: { contains: req.query.key, mode: "insensitive" } },
                        { genericName: { contains: req.query.key, mode: "insensitive" } },
                        { brandName: { contains: req.query.key, mode: "insensitive" } },
                    ]
                },
                include: {
                    category: true,
                    supplier: true,
                    batches: true,
                },
                skip: Number(skip),
                take: Number(limit),
            });

            const aggregations = await prisma.medicine.aggregate({
                where: {
                    OR: [
                        { medicineName: { contains: req.query.key, mode: "insensitive" } },
                        { genericName: { contains: req.query.key, mode: "insensitive" } },
                        { brandName: { contains: req.query.key, mode: "insensitive" } },
                    ]
                },
                _count: { id: true }
            });

            return res.status(200).json({
                getAllMedicine: medicines,
                totalMedicine: aggregations._count.id,
            });
        }
        else {
            const { skip, limit } = getPagination(req.query);

            const medicines = await prisma.medicine.findMany({
                orderBy: { id: "desc" },
                include: {
                    category: true,
                    supplier: true,
                    batches: true,
                },
                skip: Number(skip),
                take: Number(limit),
            });

            const aggregations = await prisma.medicine.aggregate({
                _count: { id: true }
            });

            return res.status(200).json({
                getAllMedicine: medicines,
                totalMedicine: aggregations._count.id,
            });
        }
    } catch (err) {
        console.error("Get All Medicines Error:", err);

        return res.status(500).json({
            status: false,
            message: "Server error",
            error: err.message,
        });
    }

}


module.exports = { createMedicine, getAllMedicine };
