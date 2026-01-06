import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ status: false, message: "Name is required" });
      return;
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
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
