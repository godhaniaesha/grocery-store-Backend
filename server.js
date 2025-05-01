require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db/db");
const indexRoutes = require("./routes/indexRoutes");
const server = express();
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');

server.use(express.json());

server.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase the timeout for the server
server.timeout = 60000; // 60 seconds

server.use("/api", indexRoutes);
server.use('/public', express.static(path.join(__dirname, 'public')));

server.listen(port, () => {
  connectDB();
  console.log(`Server Is Connected at port ${port}`);
});