const express = require('express');
const router = express.Router();
const Scan = require("../models/Scan");
const protect = require("../middleware/protect");
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration (Should be in your main server file or here)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @route   POST /api/scans/save
// @desc    Upload image to Cloudinary and save scan data to MongoDB
router.post("/save", protect, async (req, res) => {
  try {
    const { 
      medicineName, 
      composition, 
      usage, 
      dosage, 
      manufacturer, 
      side_effects, 
      warning,
      buy_link,
      generic_name,
      alternatives,
      image // This is the Base64 string from React
    } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // 1. Upload Base64 to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "medilens_scans",
      resource_type: "image"
    });

    // 2. Create Scan with Cloudinary URL
    const newScan = new Scan({
      user: req.user.id, 
      medicineName,
      composition,
      usage,
      dosage,
      manufacturer,
      side_effects,
      warning,
      buy_link,
      generic_name,
      alternatives,
      image: uploadResponse.secure_url // URL instead of Base64
    });

    await newScan.save();
    res.status(201).json({ success: true, scan: newScan });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Error saving scan" });
  }
});

// @route   GET /api/scans
// @desc    Get all scans for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const history = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

// @route   DELETE /api/scans/:id
// @desc    Delete scan from DB and image from Cloudinary
// backend/routes/history.js - Inside the DELETE route
router.delete("/:id", protect, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: "Scan not found" });

    // IMPROVEMENT: More reliable publicId extraction
    const publicId = scan.image.split('/').slice(-2).join('/').split('.')[0]; 
    // Result: "medilens_scans/filename"
    
    await cloudinary.uploader.destroy(publicId);
    await scan.deleteOne();

    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Delete Error" });
  }
});

module.exports = router;