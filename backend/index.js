require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { config, configDotenv } = require('dotenv');
const mongoose = require('mongoose');
const authRoutes=require('./routes/auth');
const historyRoutes=require('./routes/history');
const app = express();
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
app.use(cors({ 
    origin: ["http://localhost:5173", "https://medi-lens-pi.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use('/api/auth', authRoutes);      
app.use('/api/history', historyRoutes); 

app.get('/', (req, res) => {
  res.send('MediLens Backend is running');
});

app.listen(process.env.PORT, () => {
  console.log('http://localhost:' + process.env.PORT);
});