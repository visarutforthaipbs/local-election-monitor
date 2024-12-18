// Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const PROVINCE_API_URL = "https://localbudgeting.actai.co/data/2567/pao-";

app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// Schemas and Models
const ElectionSchema = new mongoose.Schema({
  province: { type: String, required: true },
  electionDate: { type: String },
  candidates: [
    {
      name: { type: String, required: true },
      party: { type: String },
      votes: { type: Number },
      percentage: { type: Number },
    },
  ],
  totalVotes: { type: Number },
  turnout: { type: Number },
  validVotes: { type: Number },
  invalidVotes: { type: Number },
  noVotePreference: { type: Number },
  totalRegistered: { type: Number },
});

const FeedbackSchema = new mongoose.Schema({
  province: { type: String, required: true },
  name: { type: String, default: "Anonymous" },
  feedback: { type: String, required: true },
  userNeeds: [{ type: String }], // New user needs field
  timestamp: { type: Date, default: Date.now },
});

const Election = mongoose.model("Election", ElectionSchema, "elections");
const Feedback = mongoose.model("Feedback", FeedbackSchema, "feedbacks");

// Routes

// Budget API endpoint
app.get("/api/budget/:province", async (req, res) => {
  try {
    const provinceName = req.params.province;
    const url = `${PROVINCE_API_URL}${encodeURIComponent(provinceName)}.json`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching budget data for ${req.params.province}:`,
      error.message
    );
    res.status(500).json({ error: "Failed to fetch budget data" });
  }
});

// Elections API endpoints
app.get("/api/elections", async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch elections data" });
  }
});

app.get("/api/elections/:province", async (req, res) => {
  try {
    const election = await Election.findOne({ province: req.params.province });
    if (!election) {
      return res.status(404).json({ error: "Province not found" });
    }
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch province data" });
  }
});

// Feedback API endpoints

// Submit feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    console.error("Error submitting feedback:", err.message);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Fetch feedback for a province
app.get("/api/feedback/:province", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ province: req.params.province });
    const feedbackTexts = feedbacks.map((entry) => entry.feedback);
    res.json(feedbackTexts);
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// NEW ROUTES: User Needs Collection and Aggregation

// Submit user needs
app.post("/api/user-needs", async (req, res) => {
  try {
    const { province, userNeeds } = req.body;

    if (!province || !userNeeds || !userNeeds.length) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Update existing feedback or create a new one
    const feedback = await Feedback.findOneAndUpdate(
      { province },
      { $push: { userNeeds: { $each: userNeeds } } },
      { new: true, upsert: true }
    );

    res
      .status(201)
      .json({ message: "User needs submitted successfully!", feedback });
  } catch (err) {
    console.error("Error submitting user needs:", err.message);
    res.status(500).json({ error: "Failed to submit user needs" });
  }
});

// Fetch aggregated user needs for a province
app.get("/api/user-needs/:province", async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ province: req.params.province });

    if (!feedback || !feedback.userNeeds.length) {
      return res.status(404).json({ message: "No user needs found" });
    }

    // Aggregate user needs into word frequencies
    const userNeedsCount = feedback.userNeeds.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    res.json({ userNeeds: userNeedsCount });
  } catch (err) {
    console.error("Error fetching user needs:", err.message);
    res.status(500).json({ error: "Failed to fetch user needs" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
