const { createPaypalOrder, capturePaypalOrder } = require('../service/paypal.service.js');
const { enviarFactura } = require('../utils/email.js');

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

    console.log(
      'BODY RECIBIDO:',
      req.body
    );

    // =========================
    // VALIDAR ORDER ID
    // =========================

    if (!orderId) {

      return res.status(400).json({

        error:
          'orderId es obligatorio'

      });

    }

    // =========================
    // VALIDAR USUARIO
    // =========================

    if (!usuario) {

      return res.status(400).json({

        error:
          'Usuario no enviado'

      });

    }

    console.log(
      'USUARIO RECIBIDO:',
      usuario
    );

    // =========================
    // CAPTURAR PAYPAL
    // =========================

    const captureData =

      await capturePaypalOrder(
        orderId
      );

    console.log(
      'Status PayPal:',
      captureData.status
    );

    // =========================
    // TEXTO PRODUCTOS
    // =========================

    const productosTexto =

      (items || [])

      .map(item =>

        `${item.name}
        (${item.cantidad || 1})`

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

    const idPedido =
      pedidoResult.insertId;

    console.log(
      'Pedido insertado:',
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

        `Stock actualizado:
        ${item.id}`

      );

    }

    // =========================
    // GENERAR XML
    // =========================

    const fecha =

      new Date()
      .toLocaleString('es-MX');

    let xml =

`<?xml version="1.0" encoding="UTF-8"?>

<factura>

  <empresa>

    <nombre>Luxe Catalog</nombre>

    <rfc>LUX010101AAA</rfc>

  </empresa>

  <cliente>

    <nombre>${usuario.usuario}</nombre>

  </cliente>

  <compra>

    <fecha>${fecha}</fecha>

    <productos>
`;

    for (const item of items) {

      xml +=

`
      <producto>

        <id>${item.id}</id>

        <nombre>${item.name}</nombre>

        <precio>${item.price}</precio>

        <cantidad>${item.cantidad || 1}</cantidad>

      </producto>
`;

    }

    xml +=

`
    </productos>

    <total>${total}</total>

  </compra>

</factura>
`;

    // =========================
    // ENVIAR FACTURA
    // =========================

    if (usuario.correo) {

      await enviarFactura(

        usuario.correo,

        xml

      );

      console.log(

        'Factura enviada a:',

        usuario.correo

      );

    } else {

      console.log(
        'Usuario sin correo'
      );

    }

    // =========================
    // RESPUESTA FINAL
    // =========================

    res.status(200).json({

      success: true,

      pedidoGuardado: true,

      facturaEnviada: true,

      mensaje:
        'Factura enviada a su correo',

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