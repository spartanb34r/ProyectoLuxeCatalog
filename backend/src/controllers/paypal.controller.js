const {
  createPaypalOrder,
  capturePaypalOrder
} = require('../service/paypal.service.js');

const conexion =
  require('../config/db.js');

async function createOrder(req, res) {

  try {

    const { items, total } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return res.status(400).json({
        error: 'El carrito está vacío'
      });

    }

    if (!total || Number(total) <= 0) {

      return res.status(400).json({
        error: 'El total es inválido'
      });

    }

    const order =
      await createPaypalOrder({
        items,
        total
      });

    res.status(200).json({
      id: order.id,
      status: order.status
    });

  } catch (error) {

    console.error(
      'Error en createOrder:',
      error
    );

    res.status(500).json({
      error: 'No se pudo crear la orden',
      detalle: error.message
    });

  }

}

async function captureOrder(req, res) {

  try {

    const {
      orderId,
      items,
      total,
      usuario
    } = req.body;

    console.log('BODY RECIBIDO:', req.body);

    if (!orderId) {

      return res.status(400).json({
        error: 'orderId es obligatorio'
      });

    }

    // =========================
    // VALIDAR USUARIO
    // =========================

    if (!usuario) {

      return res.status(400).json({
        error: 'Usuario no enviado desde frontend'
      });

    }

    console.log('USUARIO RECIBIDO:', usuario);

    // =========================
    // CAPTURAR PAGO PAYPAL
    // =========================

    const captureData =
      await capturePaypalOrder(orderId);

    console.log(
      'Status PayPal capture:',
      captureData.status
    );

    // =========================
    // TEXTO PRODUCTOS
    // =========================

    const productosTexto = (items || [])
      .map(item =>

        `${item.name} (${item.cantidad || 1})`

      )
      .join(', ');

    // =========================
    // INSERTAR PEDIDO
    // =========================

    const [pedidoResult] =
      await conexion.query(

        `
        INSERT INTO pedidos
        (
          productos,
          precio_total
        )
        VALUES (?, ?)
        `,

        [
          productosTexto,
          total
        ]

      );

    console.log(
      'Pedido insertado:',
      pedidoResult
    );

    const idPedido =
      pedidoResult.insertId;

    console.log(
      'ID Pedido:',
      idPedido
    );

    // =========================
    // INSERTAR DETALLE PEDIDO
    // =========================

    await conexion.query(

      `
      INSERT INTO detalle_pedido
      (
        id_pedido,
        id_usuario,
        usuario,
        productos,
        precio_total
      )
      VALUES (?, ?, ?, ?, ?)
      `,

      [
        idPedido,

        // AQUÍ ESTABA EL ERROR
        usuario.id ||

        usuario.id_usuario ||

        null,

        usuario.usuario,

        productosTexto,

        total
      ]

    );

    console.log(
      'Detalle pedido guardado'
    );

    // =========================
    // DESCONTAR STOCK
    // =========================

    for (const item of items) {

      await conexion.query(

        `
        UPDATE productos
        SET stock = stock - ?
        WHERE id = ?
        `,

        [
          item.cantidad || 1,
          item.id
        ]

      );

      console.log(
        `Stock actualizado para producto ${item.id}`
      );

    }

    // =========================
    // RESPUESTA FINAL
    // =========================

    res.status(200).json({

      success: true,

      pedidoGuardado: true,

      idPedido,

      captureData

    });

  } catch (error) {

    console.error(
      'Error en captureOrder:',
      error
    );

    res.status(500).json({

      error:
        'No se pudo capturar la orden',

      detalle:
        error.message

    });

  }

}

module.exports = {
  createOrder,
  captureOrder
};