const { z } = require("zod");

const batchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
});

const createMedicineSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  genericName: z.string().min(1, "Generic name is required"),
  brandName: z.string().min(1, "Brand name is required"),
  description: z.string().optional(),

  dosageType: z.string().min(1, "Dosage type is required"),
  unitType: z.string().min(1, "Unit type is required"),

  reorderLevel: z.number().int().nonnegative().optional(),

  categoryId: z.number().int().positive("Category ID is required"),
  supplierId: z.number().optional(),

  batches: z.array(batchSchema).min(1, "At least one batch is required"),
});

module.exports = {
  batchSchema,
  createMedicineSchema,
};
