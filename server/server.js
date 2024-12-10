const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// Election schema and model
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

const Election = mongoose.model("Election", ElectionSchema, "elections");

// Routes
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
