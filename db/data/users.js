const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  address: {
    addressLine: String,
    postcode: String,
  },
  contact: {
    phoneNumber: String,
    email: String,
  },
  technician: {
    type: {
      services: [{ name: String, price: Number }],
      reviews: [{ reviewBody: String, rating: String, reviewedBy: String }],
    },
    enum: [Object, null],
    default: null,
  },
  reviews: [
    {
      reviewBody: String,
      rating: String,
      reviewedBy: String,
    },
  ],
  avatarUrl: String,
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
