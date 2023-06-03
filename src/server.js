const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(
  "mongodb+srv://amitesh5q2:pew102030@cluster0.ewtjnbv.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define Doctor schema
const doctorSchema = new mongoose.Schema({
  name: String,
  address: String,
});

// Create Doctor model
const Doctor = mongoose.model("Doctor", doctorSchema);

// Add doctor route
app.post("/doctors", async (req, res) => {
  const { name, address } = req.body;

  try {
    const doctor = new Doctor({ name, address });
    await doctor.save();
    res.status(201).json({ message: "Doctor added successfully" });
  } catch (error) {
    console.error("Error adding doctor", error);
    res.status(500).json({ error: "Failed to add doctor" });
  }
});

// Get doctors route
app.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name address");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error getting doctors", error);
    res.status(500).json({ error: "Failed to get doctors" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
