const express = require('express');
const { createOrder, captureOrder } = require('../controllers/paypal.controller.js');

const Router = express.Router();

Router.post('/create-order', createOrder);
Router.post('/capture-order', captureOrder);

module.exports = Router;