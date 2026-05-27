const db = require('../config/db');


// =========================
// PERFIL
// =========================

const getProfile = async (req, res) => {

  try {

    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
      id_usuario,
      usuario,
      correo
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [userId]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });

    }

    res.json(rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje: 'Error al obtener perfil'
    });

  }

};


// =========================
// HISTORIAL
// =========================

const getOrderHistory = async (req, res) => {

  try {

    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT *
      FROM pedidos
      WHERE usuario_id = ?
      ORDER BY fecha DESC
      `,
      [userId]
    );

    res.json(rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje: 'Error al obtener historial'
    });

  }

};

module.exports = {
  getProfile,
  getOrderHistory
};