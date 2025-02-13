require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Import Routes
const productRoutes = require("./productRoutes");
const orderRoutes = require("./orderRoutes");
const Product = require("./product"); // ✅ Import the Product model

// ✅ Initialize Express App
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection (Updated)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✔️ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Exit process if DB fails
    });

// ✅ Ensure "uploads" directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage }); 

// ✅ Serve Static Files
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// ✅ Use Modular Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Default Route
app.get("/", (req, res) => res.send("🚀 VDECK API is running..."));

// ✅ API to Add Product (Supports Multiple Images)
app.post("/api/products", upload.array("images", 6), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;

        if (!name || !price || !category || req.files.length === 0) {
            return res.status(400).json({ error: "❌ Please fill in all fields and upload at least one image." });
        }

        // 🔧 FIX: Convert relative paths to absolute URLs
        const imageUrls = req.files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

        const newProduct = new Product({ name, price, category, description, images: imageUrls });
        await newProduct.save();

        res.status(201).json({ message: "✔️ Product added successfully!", product: newProduct });
    } catch (error) {
        console.error("❌ Error saving product:", error);
        res.status(500).json({ error: "❌ Internal Server Error", details: error.message });
    }
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "❌ Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
// ✅ API to Get a Single Product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "❌ Product not found." });
        }
        res.json(product);
    } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).json({ error: "❌ Internal Server Error" });
    }
});

app.post("/api/orders", upload.single("paymentProof"), async (req, res) => {
    try {
        const { fullname, gcash, address, items, total } = req.body;

        if (!fullname || !gcash || !address || !items || !total || !req.file) {
            return res.status(400).json({ error: "❌ Please fill in all required fields and upload payment proof." });
        }

        // ✅ Store full URL instead of relative path
        const paymentProofUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        const newOrder = new Order({
            fullname,
            gcash,
            address,
            items: JSON.parse(items),
            total,
            paymentProof: paymentProofUrl, // ✅ Store absolute URL in MongoDB
        });

        await newOrder.save();
        res.status(201).json({ message: "✔️ Order placed successfully!", order: newOrder });
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ error: "❌ Internal Server Error", details: error.message });
    }
});

