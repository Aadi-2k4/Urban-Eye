// server.js - Node.js Express server with MongoDB / Mongoose integration
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { defaultUsers, initialComplaints } from "./seedData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urbaneye";

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Support large base64 image uploads
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB database successfully.");
    seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Schema definitions
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

const CommentSchema = new mongoose.Schema({
  id: String,
  user: String,
  text: String,
  time: String
});

const EscalationLogSchema = new mongoose.Schema({
  timestamp: Number,
  byUser: String,
  details: String
});

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  category: String,
  titleEn: String,
  titleMl: String,
  descEn: String,
  descMl: String,
  location: String,
  district: String,
  lat: Number,
  lng: Number,
  image: String,
  createdAt: Number,
  status: String,
  seriousness: String,
  originalSeriousness: String,
  citizen: String,
  upvotes: Number,
  upvotedBy: [String],
  comments: [CommentSchema],
  hierarchyLevel: String,
  originalHierarchyLevel: String,
  assignedDepartment: String,
  escalationStatus: String,
  escalationLogs: [EscalationLogSchema],
  agingResetLog: [mongoose.Schema.Types.Mixed],
  simulatedDaysAtCreation: Number,
  scheduledDate: String,
  resolvedDate: String,
  resolutionNotes: String,
  resolutionImage: String,
  assignedTeam: String,
  technicianName: String,
  technicianPhone: String
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

// Auto-seeding logic
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(defaultUsers);
      console.log("Database initialized: Default users seeded.");
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      await Complaint.insertMany(initialComplaints);
      console.log("Database initialized: Initial complaints seeded.");
    }
  } catch (err) {
    console.error("Error seeding the database:", err);
  }
};

// API Routes

// Authentication
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Case-insensitive username match
    const user = await User.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });
    if (user && user.password === password) {
      return res.json({ name: user.name, username: user.username, role: user.role });
    }

    // Super Admin fallback bypass (if not registered in seeded users)
    if (username.toLowerCase() === "admin" && password === "admin") {
      return res.json({ name: "Government Administrator", role: "admin", username: "admin" });
    }

    return res.status(401).json({ error: "Invalid credentials." });
  } catch (err) {
    console.error("Login API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const exists = await User.findOne({ username: { $regex: new RegExp("^" + username + "$", "i") } });
    if (exists) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const newUser = new User({ name, username, password, role: "citizen" });
    await newUser.save();

    res.status(201).json({ name: newUser.name, username: newUser.username, role: newUser.role });
  } catch (err) {
    console.error("Signup API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Complaints CRUD
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Get complaints API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/complaints", async (req, res) => {
  try {
    const complaintData = req.body;
    const newComplaint = new Complaint(complaintData);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    console.error("Create complaint API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.put("/api/complaints/bulk", async (req, res) => {
  try {
    const complaints = req.body;
    if (!Array.isArray(complaints)) {
      return res.status(400).json({ error: "Body must be an array of complaints." });
    }

    const ops = complaints.map((c) => {
      const updateData = { ...c };
      delete updateData._id; // Ensure we don't try to update the immutable _id field
      return {
        updateOne: {
          filter: { id: c.id },
          update: { $set: updateData },
          upsert: true
        }
      };
    });

    await Complaint.bulkWrite(ops);
    res.json({ success: true, count: complaints.length });
  } catch (err) {
    console.error("Bulk update complaints API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/complaints/reset", async (req, res) => {
  try {
    await Complaint.deleteMany({});
    await Complaint.insertMany(initialComplaints);
    console.log("Database reset to pristine seed data.");
    res.json(initialComplaints);
  } catch (err) {
    console.error("Reset complaints API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Urban-Eye Backend Server is running on port ${PORT}`);
});
