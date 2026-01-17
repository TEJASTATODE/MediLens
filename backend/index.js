require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, BUCKET_NAME } = require("./utils/s3");

const authRoutes = require("./routes/auth");
const historyRoutes = require("./routes/history");

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);


app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});


app.use(
  cors({
    origin: ["https://medi-lens-pi.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileKey = `reports/${Date.now()}-${req.file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    res.json({
      message: "✅ File uploaded to S3",
      key: fileKey,
    });
  } catch (err) {
    console.error("❌ S3 Upload Error:", err);
    res.status(500).json({ error: "S3 upload failed" });
  }
});

app.get("/", (req, res) => {
  res.send("MediLens Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
