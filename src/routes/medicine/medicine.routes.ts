import express, { Router } from "express";
import multer from "multer"
import { protectedRoutes } from "../../middleware/protectedRoutes";
import { createMedicine, getAllMedicine,  } from "./medicine.controller";


const upload=multer({storage:multer.memoryStorage()})
const medicineRoutes: Router = express.Router();

medicineRoutes.get("/", protectedRoutes, getAllMedicine);
medicineRoutes.post("/", protectedRoutes, upload.single("file"), createMedicine);

export default medicineRoutes;
