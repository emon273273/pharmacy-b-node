import { Request, Response } from "express";
import prisma from "../../utils/prisma";

interface CreateSupplierBody {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address } = req.body as CreateSupplierBody;

    if (!name) {
      res.status(400).json({ status: false, message: "Name is required" });
      return;
    }

    const supplier = await prisma.supplier.create({
      data: { name, email, phone, address },
    });

    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: false,
      message: "Server error",
      error: err.message,
    });
  }
};
