const express = require('express');

const { CreateMedicine } = require("./medicine.controller")
const medicineRoutes = express.Router();


medicineRoutes.post('/', CreateMedicine);



module.exports = medicineRoutes;