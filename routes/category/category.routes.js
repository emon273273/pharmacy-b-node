const express = require('express');
const { createCategory } = require('./category.controller');


const categoryRoutes = express.Router();


categoryRoutes.post('/', createCategory);



module.exports = categoryRoutes;