// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Route imports
const authRoutes = require('./routes/authRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const foodLogRoutes = require('./routes/foodLogRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Make io available globally
global.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('📱 Frontend client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📱 Frontend client disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/diet-plan', dietPlanRoutes);
app.use('/api/food-log', foodLogRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("Balanced Bites API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Socket.io enabled for real-time updates`);
});

