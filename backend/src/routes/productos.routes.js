const express = require('express');
const router = express.Router();
const { getProductos } = require('../controllers/productos.controller');
const { verifyToken } = require('../middleware/auth.middleware');
router.get('/productos', verifyToken, getProductos);
module.exports = router;