import { Request, Response } from "express";
import getPagination from "../../utils/paginateQuery";
import prisma from "../../utils/prisma";
import { createMedicineSchema } from "../../utils/schema/createMedicineSchema";

interface MedicineQuery {
  query?: string;
  key?: string;
  page?: string;
  count?: string;
}

export const createMedicine = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1️⃣ Validate input
    const parsed = createMedicineSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: false,
        message: "Validation Error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parsed.data;

    // create medicine with batches
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

    res.status(201).json({
      message: "Medicine created successfully",
      createdMedicine: medicine,
    });
  } catch (err) {
    const error = err as Error;
    console.error("Create Medicine Error:", error);

    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllMedicine = async (req: Request, res: Response): Promise<void> => {
  try {

    
    const query = req.query as MedicineQuery;

    if (query.query === "all") {
      const medicines = await prisma.medicine.findMany({
        orderBy: { id: "desc" },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
      });

      res.status(200).json(medicines);
      return;
    } else if (query.query === "search") {
      const { skip, limit } = getPagination(query);

      const medicines = await prisma.medicine.findMany({
        orderBy: { id: "desc" },
        where: {
          OR: [
            { medicineName: { contains: query.key || "", mode: "insensitive" } },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
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
            { medicineName: { contains: query.key || "", mode: "insensitive" } },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
        },
        _count: { id: true },
      });

      res.status(200).json({
        getAllMedicine: medicines,
        totalMedicine: aggregations._count.id,
      });
      return;
    } else {
      const { skip, limit } = getPagination(query);

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
        _count: { id: true },
      });

      res.status(200).json({
        getAllMedicine: medicines,
        totalMedicine: aggregations._count.id,
      });
      return;
    }
  } catch (err) {
    const error = err as Error;
    console.error("Get All Medicines Error:", error);

    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
