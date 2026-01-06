import express, { Router } from "express";
import { getAllPermission, updateOtherPermission } from "./setting.controller";
import { protectedRoutes } from "../../middleware/protectedRoutes";

const settingRoutes: Router = express.Router();

settingRoutes.get("/allpermission", protectedRoutes, getAllPermission);
settingRoutes.patch("/updateotherpermission", protectedRoutes, updateOtherPermission);

export default settingRoutes;
