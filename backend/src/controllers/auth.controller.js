const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// =========================
// REGISTRO
// =========================

const register = async (req, res) => {

  try {

    const { usuario, correo, contrasena } = req.body;

    // Verificar si usuario existe
    const [existingUser] = await db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existingUser.length > 0) {

      return res.status(400).json({
        mensaje: 'El usuario ya existe'
      });

    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(
      contrasena,
      10
    );

    // Insertar usuario
    await db.query(
      `
      INSERT INTO usuarios
      (usuario, correo, contrasena)
      VALUES (?, ?, ?)
      `,
      [usuario, correo, hashedPassword]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje: 'Error al registrar usuario'
    });

  }

};


// =========================
// LOGIN
// =========================

const login = async (req, res) => {

  try {

    const { correo, contrasena } = req.body;

    // Buscar usuario
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    // Validar existencia
    if (rows.length === 0) {

      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });

    }

    const user = rows[0];

    // Comparar contraseña
    const validPassword = await bcrypt.compare(
      contrasena,
      user.contrasena
    );

    if (!validPassword) {

      return res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });

    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        correo: user.correo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    // Respuesta
    res.json({
    mensaje: 'Login correcto',
    token,
    usuario: {
      id_usuario:
        user.id_usuario,
      usuario:
        user.usuario,
      correo:
        user.correo
  }

});

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje: 'Error en login'
    });

  }

};

module.exports = {
  register,
  login
};