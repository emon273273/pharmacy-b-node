import express, { Router } from "express";
import { protectedRoutes } from "../../middleware/protectedRoutes";
import { createMedicine, getAllMedicine } from "./medicine.controller";

const medicineRoutes: Router = express.Router();

medicineRoutes.get("/", protectedRoutes, getAllMedicine);
medicineRoutes.post("/", protectedRoutes, createMedicine);

export default medicineRoutes;
