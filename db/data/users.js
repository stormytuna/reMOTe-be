const mongoose = require("mongoose");
const { postcodeRegex, phoneNumberRegex } = require("../../utils");

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
    postcode: {
      type: String,
      validator: function (value) {
        return postcodeRegex.test(value);
      },
    },
  },
  contact: {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          console.log(value);
          return phoneNumberRegex.test(value);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
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
  avatarUrl: { type: String, default: "https://i.imgur.com/pN04qjy.jpg" },
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
