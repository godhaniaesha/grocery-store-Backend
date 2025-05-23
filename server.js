require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db/db");
const indexRoutes = require("./routes/indexRoutes");
const server = express();
const port = process.env.PORT || 4000;
const path = require('path');
const cors = require('cors');

// Apply CORS before any route handling
server.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers']
}));

// Add a specific handler for OPTIONS requests
server.options('*', cors());

// Increase payload size limit for JSON
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb', extended: true }));

// Increase the timeout for the server
server.timeout = 60000; // 60 seconds

server.use("/api", indexRoutes);
server.use('/public', express.static(path.join(__dirname, 'public')));

server.listen(port, () => {
  connectDB();
  console.log(`Server Is Connected at port ${port}`);
});