// server.js
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const dbConect = require("./config/dbconnection")

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const indexRoutes = require('./Routes');
dbConect()
// Use routes
app.use('/api', indexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;