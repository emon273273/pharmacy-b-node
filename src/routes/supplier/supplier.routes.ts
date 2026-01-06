import express, { Router } from "express";
import { createSupplier } from "./supplier.controller";

const supplierRoutes: Router = express.Router();

supplierRoutes.post("/", createSupplier);

export default supplierRoutes;
