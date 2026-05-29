const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const productosRoutes = require('./routes/productos.routes');
const paypalRoutes = require('./routes/paypal.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const pedidosRoutes = require('./routes/pedidos.routes');

app.use('/api', productosRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pedidos', pedidosRoutes);

module.exports = app;