const nodemailer = require('nodemailer');

const transporter =
  nodemailer.createTransport({

    service: 'gmail',

    auth: {

      user:
        'a22300914@ceti.mx',

      pass:
        'ouit spar tgtv hidn'

    }

  });

async function enviarFactura({

  correo,
  asunto,
  xml

}) {

  await transporter.sendMail({

    from:
      'Luxe Catalog <a22300914@ceti.mx>',

    to:
      correo,

    subject:
      asunto,

    // XML visible
    text:
      xml,

    // XML adjunto
    attachments: [

      {

        filename:
          'factura.xml',

        content:
          xml

      }

    ]

  });

}

module.exports = {

  enviarFactura

};