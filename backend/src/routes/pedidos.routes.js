const express = require('express');
const router = express.Router();
const db = require('../config/db');

// OBTENER PEDIDOS POR USUARIO
router.get('/', async (req, res) => {

  try {

    const { id_usuario } = req.query;

    const [rows] = await db.query(
      `SELECT id_pedido, productos, precio_total
       FROM detalle_pedido
       WHERE id_usuario = ?
       ORDER BY id_pedido DESC`,
      [id_usuario]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }

});
module.exports = router;