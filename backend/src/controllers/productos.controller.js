const db = require('../config/db');

const getProductos = async (req, res) => {

  try {

    const sql = 'SELECT * FROM productos';

    const [resultados] = await db.query(sql);

    res.json(resultados);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Error al obtener productos'
    });

  }

};

module.exports = {
  getProductos
};