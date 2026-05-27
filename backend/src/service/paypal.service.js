const {
  paypalConfig
} = require('../config/paypal.config.js');

function getBasicAuth() {

  return Buffer
    .from(
      `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
    )
    .toString('base64');

}

async function getAccessToken() {

  const response = await fetch(

    `${paypalConfig.baseUrl}/v1/oauth2/token`,

    {
      method: 'POST',

      headers: {

        'Authorization':
          `Basic ${getBasicAuth()}`,

        'Content-Type':
          'application/x-www-form-urlencoded'

      },

      body:
        'grant_type=client_credentials'
    }

  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(

      `Error obteniendo access token:
      ${JSON.stringify(data)}`

    );

  }

  return data.access_token;

}

async function createPaypalOrder(orderData) {

  const accessToken =
    await getAccessToken();

  // TOTAL REAL
  const totalCalculado =
    orderData.items.reduce(

      (acc, item) => {

        return acc +

          (

            Number(item.price)

            *

            Number(
              item.cantidad || 1
            )

          );

      },

      0

    );

  console.log(
    'TOTAL CALCULADO:',
    totalCalculado
  );

  console.log(
    'ITEMS:',
    orderData.items
  );

  const body = {

    intent: 'CAPTURE',

    purchase_units: [

      {

        amount: {

          currency_code: 'MXN',

          value:
            totalCalculado.toFixed(2),

          breakdown: {

            item_total: {

              currency_code: 'MXN',

              value:
                totalCalculado.toFixed(2)

            }

          }

        },

        items: orderData.items.map(

          item => ({

            name:
              item.name,

            quantity:
              String(
                item.cantidad || 1
              ),

            unit_amount: {

              currency_code: 'MXN',

              value:
                Number(item.price)
                  .toFixed(2)

            }

          })

        )

      }

    ]

  };

  console.log(
    'BODY PAYPAL:',
    JSON.stringify(body, null, 2)
  );

  const response = await fetch(

    `${paypalConfig.baseUrl}/v2/checkout/orders`,

    {

      method: 'POST',

      headers: {

        'Content-Type':
          'application/json',

        'Authorization':
          `Bearer ${accessToken}`

      },

      body:
        JSON.stringify(body)

    }

  );

  const data =
    await response.json();

  if (!response.ok) {

    console.error(
      'ERROR PAYPAL:',
      data
    );

    throw new Error(

      `Error creando orden PayPal:
      ${JSON.stringify(data)}`

    );

  }

  return data;

}

async function capturePaypalOrder(orderId) {

  const accessToken = await getAccessToken();
   console.log('Capturando orden:', orderId);

  const response = await fetch(

    `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,

    {

      method: 'POST',

      headers: {

        'Content-Type':
          'application/json',

        'Authorization':
          `Bearer ${accessToken}`

      }

    }

  );
  console.log('Status PayPal capture:', response.status);

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(

      `Error capturando orden PayPal:
      ${JSON.stringify(data)}`

    );

  }

  return data;

}

module.exports = {

  getAccessToken,

  createPaypalOrder,

  capturePaypalOrder

};