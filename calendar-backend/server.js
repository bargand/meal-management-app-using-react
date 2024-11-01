const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/calendarApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Calendar Entry Schema with Lunch and Dinner
const entrySchema = new mongoose.Schema({
  date: String, // Store date as a string (e.g., "2023-10-30")
  lunch: {
    description: String,
    consumed: { type: Boolean, default: false },
  },
  dinner: {
    description: String,
    consumed: { type: Boolean, default: false },
  },
});

const Entry = mongoose.model("Entry", entrySchema);

// Route to get entries
app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

// Route to add/update an entry with lunch and dinner data
app.post("/entry", async (req, res) => {
  const { date, lunch, dinner } = req.body;

  const existingEntry = await Entry.findOneAndUpdate(
    { date },
    { lunch, dinner },
    { new: true }
  );
  if (!existingEntry) {
    const newEntry = await Entry.create({ date, lunch, dinner });
    res.json(newEntry);
  } else {
    res.json(existingEntry);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



//main code