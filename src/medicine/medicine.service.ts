import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMedicineDto } from "./dto/create-medicine.dto";
import { MedicineQueryDto } from "./dto/medicine-query.dto";
import * as XLSX from "xlsx";

interface MedicineRow {
  medicineName: string;
  genericName: string;
  brandName: string;
  description: string;
  dosageType: string;
  unitType: string;
  reorderLevel: number;
  categoryName: string;
  supplierName: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
}

@Injectable()
export class MedicineService {
  constructor(private readonly prisma: PrismaService) {}

  private getPagination(query: MedicineQueryDto) {
    const page = parseInt(query.page || "1") || 1;
    const limit = parseInt(query.count || "10") || 10;
    const skip = (page - 1) * limit;
    return { skip, limit };
  }

  async createSingleMedicine(data: CreateMedicineDto, branchId: number) {
    // Validate branchId
    if (!branchId) {
      throw new BadRequestException(
        "User must be assigned to a branch to create medicines",
      );
    }

    const set = new Set();

    for (const b of data.batches) {
      const key = b.batchNumber.trim();
      if (set.has(key)) {
        throw new BadRequestException("Batch number must be unique");
      }
      set.add(key);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Verify branch exists
      const branch = await tx.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        throw new BadRequestException("Branch not found");
      }

      const category = await tx.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category) {
        throw new BadRequestException("Category not found");
      }

      const supplier = await tx.supplier.findUnique({
        where: {
          id: data.supplierId,
        },
      });
      if (!supplier) {
        throw new BadRequestException("Supplier not found");
      }

      const medicine = await tx.medicine.create({
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
              branch: {
                connect: { id: branchId },
              },
            })),
          },
        },
        include: {
          batches: true,
          category: true,
          supplier: true,
        },
      });

      return medicine;
    });

    return {
      message: "Medicine created successfully",
      createdMedicine: result,
    };
  }

  async createBulkMedicine(file: Express.Multer.File) {
    // Read the Excel file
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<MedicineRow>(sheet);

    if (!rows.length) {
      throw new BadRequestException("No data found in the file");
    }

    // Extract unique category and supplier names
    const uniqueCategoryNames = [
      ...new Set(rows.map((r) => r.categoryName).filter(Boolean)),
    ];
    const uniqueSupplierNames = [
      ...new Set(rows.map((r) => r.supplierName).filter(Boolean)),
    ];

    // Fetch categories and suppliers
    const categories = await this.prisma.category.findMany({
      where: { name: { in: uniqueCategoryNames } },
      select: { id: true, name: true },
    });

    const suppliers = await this.prisma.supplier.findMany({
      where: { name: { in: uniqueSupplierNames } },
      select: { id: true, name: true },
    });

    // Create maps for easy access
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
    const supplierMap = new Map(suppliers.map((s) => [s.name, s.id]));

    // Validate: check if any category or supplier is missing
    const missingCategories = uniqueCategoryNames.filter(
      (name) => !categoryMap.has(name),
    );
    const missingSuppliers = uniqueSupplierNames.filter(
      (name) => !supplierMap.has(name),
    );

    if (missingCategories.length > 0 || missingSuppliers.length > 0) {
      throw new BadRequestException({
        status: false,
        message: "Missing categories or suppliers",
        missingCategories,
        missingSuppliers,
      });
    }

    // Group medicines by key
    const medicineMap: Record<string, any> = {};

    for (const row of rows) {
      const key = `${row.medicineName}_${row.brandName}`;
      const categoryId = categoryMap.get(row.categoryName);
      const supplierId = supplierMap.get(row.supplierName);

      if (!medicineMap[key]) {
        medicineMap[key] = {
          medicineName: row.medicineName,
          genericName: row.genericName,
          brandName: row.brandName,
          description: row.description,
          dosageType: row.dosageType,
          unitType: row.unitType,
          reorderLevel: row.reorderLevel,
          categoryId,
          supplierId,
          batches: [],
        };
      }

      medicineMap[key].batches.push({
        batchNumber: row.batchNumber,
        quantity: row.quantity,
        manufacturingDate: row.manufacturingDate,
        expiryDate: row.expiryDate,
        purchasePrice: row.purchasePrice,
        sellingPrice: row.sellingPrice,
      });
    }

    // Insert into database using transaction
    const medicineToCreate = Object.values(medicineMap);

    const result = await this.prisma.$transaction(async (tx) => {
      const createdMedicines = [];

      for (const medData of medicineToCreate) {
        const { batches, ...medicineFields } = medData;

        const newMed = await tx.medicine.create({
          data: {
            ...medicineFields,
            batches: {
              create: batches,
            },
          },
        });
        createdMedicines.push(newMed);
      }

      return createdMedicines;
    });

    return {
      message: "Medicine created successfully",
      createdMedicine: result,
    };
  }

  async getAllMedicine(query: MedicineQueryDto) {
    if (query.query === "all") {
      const medicines = await this.prisma.medicine.findMany({
        orderBy: { id: "desc" },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
      });
      return medicines;
    }

    if (query.query === "search") {
      const { skip, limit } = this.getPagination(query);

      const medicines = await this.prisma.medicine.findMany({
        orderBy: { id: "desc" },
        where: {
          OR: [
            {
              medicineName: { contains: query.key || "", mode: "insensitive" },
            },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          supplier: true,
          batches: true,
        },
        skip,
        take: limit,
      });

      const aggregations = await this.prisma.medicine.aggregate({
        where: {
          OR: [
            {
              medicineName: { contains: query.key || "", mode: "insensitive" },
            },
            { genericName: { contains: query.key || "", mode: "insensitive" } },
            { brandName: { contains: query.key || "", mode: "insensitive" } },
          ],
        },
        _count: { id: true },
      });

      return {
        getAllMedicine: medicines,
        totalMedicine: aggregations._count.id,
      };
    }

    // Default: paginated list
    const { skip, limit } = this.getPagination(query);

    const medicines = await this.prisma.medicine.findMany({
      orderBy: { id: "desc" },
      include: {
        category: true,
        supplier: true,
        batches: true,
      },
      skip,
      take: limit,
    });

    const aggregations = await this.prisma.medicine.aggregate({
      _count: { id: true },
    });

    return {
      getAllMedicine: medicines,
      totalMedicine: aggregations._count.id,
    };
  }

  async getSingleMedicine(id: number) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        batches: true,
      },
    });

    if (!medicine) throw new NotFoundException("medicine not found");
    return medicine;
  }
}
