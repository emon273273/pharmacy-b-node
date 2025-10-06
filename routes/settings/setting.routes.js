const express = require('express');

const { getAllPermission,updateOtherPermission } = require("./setting.controller");
const protectedRoutes = require('../../middleware/protectedRoutes');
const settingRoutes = express.Router();

settingRoutes.get("/allpermission", protectedRoutes, getAllPermission);
settingRoutes.patch("/updateotherpermission", protectedRoutes, updateOtherPermission);

module.exports = settingRoutes;