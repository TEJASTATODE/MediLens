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

/* ===================== SECURITY ===================== */
app.set("trust proxy", 1);
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: ["https://medi-lens-pi.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===================== BODY LIMITS (FIX FOR OOM) ===================== */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

/* ===================== FILE UPLOAD (STREAMING → S3) ===================== */
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
        Body: req.file.stream, // ✅ STREAM (NO MEMORY BUFFER)
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

/* ===================== HEALTH CHECK ===================== */
app.get("/", (req, res) => {
  res.send("MediLens Backend is running");
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});

/* ===================== GRACEFUL SHUTDOWN ===================== */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down.");
  process.exit(0);
});
