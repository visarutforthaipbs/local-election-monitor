// server.js

// 1. Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const { Client } = require("@notionhq/client"); // Notion SDK

dotenv.config();

const app = express();

// 2. Environment and config
const PORT = process.env.PORT || 5005;
const PROVINCE_API_URL = "https://localbudgeting.actai.co/data/2567/pao-";

// 3. Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 4. Middleware
app.use(cors()); // Allows requests from any origin. Restrict if needed.
app.use(express.json());

// 5. Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// 6. Define Schemas & Models
const ElectionSchema = new mongoose.Schema({
  province: { type: String, required: true },
  electionDate: { type: String },
  candidates: [
    {
      name: { type: String, required: true },
      party: { type: String },
      votes: { type: Number },
      percentage: { type: Number },
      imageUrl: { type: String },
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
  userNeeds: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
});

const Election = mongoose.model("Election", ElectionSchema, "elections");
const Feedback = mongoose.model("Feedback", FeedbackSchema, "feedbacks");

// 7. Routes

// 7A. Budget API Endpoint
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

// 7B. Elections API
app.get("/api/elections", async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    console.error("Error fetching elections:", err.message);
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
    console.error("Error fetching single election:", err.message);
    res.status(500).json({ error: "Failed to fetch province data" });
  }
});

// 7C. Feedback API Endpoints

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

// 7D. User Needs (for Word Cloud)

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

// 7E. Articles from Notion
app.get("/api/articles/:province", async (req, res) => {
  const province = req.params.province;

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "Province",
        select: {
          equals: province,
        },
      },
    });

    const articles = response.results.map((result) => {
      return {
        // Now we use ["article-title"] to match the renamed column
        // and assume it's a rich_text property:
        title:
          result.properties?.["article-title"]?.rich_text?.[0]?.plain_text ||
          "Untitled",
        summary:
          result.properties?.Summary?.rich_text?.[0]?.plain_text ||
          "No summary available",
        url: result.properties?.URL?.url || "#",
        thumbnail: result.properties?.Thumbnail?.url || "",
      };
    });

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles from Notion:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// 8. Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
