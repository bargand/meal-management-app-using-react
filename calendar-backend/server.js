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

// Calendar Entry Schema
const entrySchema = new mongoose.Schema({
  date: String, // Store date as a string (e.g., "2023-10-30")
  description: String, // Note for the date
});

const Entry = mongoose.model("Entry", entrySchema);

// Route to get entries
app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

// Route to add/update an entry
app.post("/entry", async (req, res) => {
  const { date, description } = req.body;

  

  // Update existing entry or create new one
  const existingEntry = await Entry.findOneAndUpdate(
    { date },
    { description },
    { new: true }
  );
  if (!existingEntry) {
    const newEntry = await Entry.create({ date, description });
    res.json(newEntry);
  } else {
    res.json(existingEntry);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//MAIN CODE