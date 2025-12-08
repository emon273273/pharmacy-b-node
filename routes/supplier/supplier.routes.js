const express = require('express');
const { createSupplier } = require('./supplier.controller');
const supplierRoutes = express.Router();


supplierRoutes.post('/', createSupplier);



module.exports = supplierRoutes;