const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
// SDK de PayPal para integrar la pasarela de pagos
const paypal = require('@paypal/paypal-server-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tienda'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

/*app.get('/api/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});*/

app.get('/api/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convertir inStock de string a booleano
    const productos = results.map(p => ({
      ...p,
      inStock: p.inStock === 'true'
    }));
    res.json(productos);
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});