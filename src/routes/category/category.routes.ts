import express, { Router } from "express";
import { createCategory } from "./category.controller";

const categoryRoutes: Router = express.Router();

categoryRoutes.post("/", createCategory);

export default categoryRoutes;
