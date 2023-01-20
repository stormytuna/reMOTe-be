const mongoose = require("mongoose");

// This creates our user schema
const scientistSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  famousFor: [String], // Funky syntax but rather intuitive, this just means an array of strings
});

module.exports = mongoose.model("Scientist", scientistSchema);
