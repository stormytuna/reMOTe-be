const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  address: {
    addressLine: String,
    postCode: String,
  },
  contact: {
    phoneNumber: String,
    email: String,
  },
  technician: {
    services: [String],
    reviews: [
      {
        reviewBody: String,
        rating: Number,
        reviewedBy: Number,
      },
    ],
  },
  reviews: [
    {
      reviewBody: String,
      rating: Number,
      reviewedBy: Number,
    },
  ],
  avatarUrl: String,
});

module.exports = mongoose.model("User", userSchema);
