const mongoose = require("mongoose");

exports.disconnect = async () => {
  await mongoose.disconnect();
  console.log("Disconnected!");
};
