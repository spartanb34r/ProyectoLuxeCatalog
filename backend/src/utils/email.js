const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: {

    user: 'a22300914@ceti.mx',

    pass: 'ouit spar tgtv hidn'

  }

});

async function enviarFactura(
  correo,
  xml
) {

  await transporter.sendMail({

  from:
    '"Luxe Catalog" <TU_CORREO@gmail.com>',

  to: correo,

  subject:
    'Factura Luxe Catalog',

  text:
`
Gracias por tu compra.

Tu factura XML:

${xml}
`,

  attachments: [

    {

      filename:
        'factura-luxe.xml',

      content: xml,

      contentType:
        'application/xml'

    }

  ]

});

}

module.exports = {
  enviarFactura
};