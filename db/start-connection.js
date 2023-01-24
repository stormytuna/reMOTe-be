const mongoose = require("mongoose");
const { username, password } = require("./mongodb-uri.json");

exports.connect = () => {
  mongoose.set('strictQuery', false);
  mongoose.connect(
    `mongodb+srv://${username}:${password}@test.cpnpkbx.mongodb.net/test`,
    () => {
      console.log("Successfully connected!");
    },
    (e) => {
      console.log("Failed to connect");
      console.error(e.message);
    }
  );
};
