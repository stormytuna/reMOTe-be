const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  address: {
    addressLine: String,
    postcode: String,
  },
  contact: {
    phoneNumber: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
  },
  technician: {
    type: {
      services: {
        type: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            description: String,
          },
        ],
        required: true,
      },
      reviews: [
        {
          reviewBody: { type: String, required: true },
          rating: { type: String, required: true, min: 0, max: 5 },
          reviewedBy: { type: String, required: true },
        },
      ],
    },
    enum: [Object, null],
    default: null,
  },
  reviews: [
    {
      reviewBody: { type: String, required: true },
      rating: { type: String, required: true, min: 0, max: 5 },
      reviewedBy: { type: String, required: true },
    },
  ],
  avatarUrl: String,
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
