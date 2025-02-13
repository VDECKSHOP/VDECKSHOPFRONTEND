const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Define Product Schema
const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    images: [String], // ✅ Supports multiple images
}));

// ✅ Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ✅ Get All Products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch products" });
    }
});

// ✅ Add a Product
router.post("/", upload.array("images", 5), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`);

        const product = new Product({ name, price, category, description, images });
        await product.save();

        res.json({ message: "✅ Product added successfully!", product });
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to add product" });
    }
});

// ✅ DELETE a Product by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "❌ Product not found." });
        }
        res.json({ message: "✅ Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Server error", details: error.message });
    }
});

module.exports = router;
