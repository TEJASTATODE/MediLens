const express = require('express');
const router = express.Router();
const Scan = require("../models/Scan");
const protect = require("../middleware/protect");
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
      image 
    } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }


    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "medilens_scans",
      resource_type: "image"
    });

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
      image: uploadResponse.secure_url 
    });

    await newScan.save();
    res.status(201).json({ success: true, scan: newScan });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Error saving scan" });
  }
});


router.get("/", protect, async (req, res) => {
  try {
    const history = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: "Scan not found" });

   
    const publicId = scan.image.split('/').slice(-2).join('/').split('.')[0]; 
   
    
    await cloudinary.uploader.destroy(publicId);
    await scan.deleteOne();

    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Delete Error" });
  }
});

module.exports = router;