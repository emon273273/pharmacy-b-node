const express = require('express');

const { getAllPermission } = require("./setting.controller");
const protectedRoutes = require('../../middleware/protectedRoutes');
const settingRoutes = express.Router();

settingRoutes.get("/allpermission", protectedRoutes, getAllPermission);

module.exports = settingRoutes;