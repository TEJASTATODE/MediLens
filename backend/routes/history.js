const express = require("express");
const router = express.Router();
const Scan = require("../models/Scan");
const protect = require("../middleware/protect");

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3, BUCKET_NAME } = require("../utils/s3");

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
      image, 
    } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

   
    const buffer = Buffer.from(image.split(",")[1], "base64");

    const imageKey = `scans/${Date.now()}.png`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: buffer,
        ContentType: "image/png",
      })
    );

    
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
      imageKey,
    });

    await newScan.save();

    res.status(201).json({
      success: true,
      scan: newScan,
    });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Error saving scan" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const history = await Scan.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    const response = await Promise.all(
      history.map(async (scan) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: scan.imageKey,
        });

        const imageUrl = await getSignedUrl(s3, command, {
          expiresIn: 300, 
        });

        return {
          ...scan.toObject(),
          imageUrl,
        };
      })
    );

    res.json(response);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});


router.delete("/:id", protect, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: scan.imageKey,
      })
    );


    await scan.deleteOne();

    res.json({ message: "Scan deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Delete Error" });
  }
});

module.exports = router;
