const mongoose = require("mongoose");

exports.disconnect = () => {
  mongoose.disconnect();
};
