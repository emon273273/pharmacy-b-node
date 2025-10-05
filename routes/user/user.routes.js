const express = require('express');

const { LoginUser } = require("./user.controller")
const userRoutes = express.Router();


userRoutes.post('/', LoginUser);



module.exports = userRoutes;