const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // foreignkey
    ref: "User", 
    required: true,
  },
  image: {
    type: String, 
  },
  medicineName: {
    type: String,
    required: true,
  },
  composition: {
    type: String,
  },
  usage: {
    type: String,
  },
  dosage: {
    type: String, 
  },
  manufacturer: {
    type: String,
  },
  side_effects: {
    type: String, 
  },
  warning: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  buy_link: { type: String },
  generic_name: { type: String },
  alternatives: [String]
}, 
{ 
  timestamps: true 
});

module.exports = mongoose.model("Scan", scanSchema);