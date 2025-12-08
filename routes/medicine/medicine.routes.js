const express = require('express');

const { createMedicine,getAllMedicine } = require("./medicine.controller")
const medicineRoutes = express.Router();

medicineRoutes.get("/"getAllMedicine);
medicineRoutes.post('/', createMedicine);



module.exports = medicineRoutes;