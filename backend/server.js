// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Route imports
const authRoutes = require('./routes/authRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const foodLogRoutes = require('./routes/foodLogRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
  res.send("Food Tracker API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

