import express, { Router } from "express";
import { LoginUser } from "./user.controller";

const userRoutes: Router = express.Router();

userRoutes.post("/", LoginUser);

export default userRoutes;
