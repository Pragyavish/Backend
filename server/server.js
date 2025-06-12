const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db"); // ✅ Destructured correctly

const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

connectDB();

app.listen(process.env.PORT || 5000, () => console.log("Server running"));
