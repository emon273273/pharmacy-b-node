const express = require('express');
const { protectedRoutes } = require("../../middleware/protectedRoutes")
const { createMedicine, getAllMedicine } = require("./medicine.controller")
const medicineRoutes = express.Router();

medicineRoutes.get("/", protectedRoutes, getAllMedicine);
medicineRoutes.post('/', protectedRoutes, createMedicine);



module.exports = medicineRoutes;