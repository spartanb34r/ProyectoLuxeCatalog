const {
  enviarFactura
} = require('./service/email.service');

async function test() {

  try {

    await enviarFactura({

      correo:
        'spartan.b34r@gmail.com',

      asunto:
        'Prueba XML',

      xml: `

<?xml version="1.0"?>

<cfdi>

  <empresa>
    Luxe Catalog
  </empresa>

</cfdi>

`

    });

    console.log(
      'Correo enviado'
    );

  } catch (error) {

    console.error(error);

  }

}

test();