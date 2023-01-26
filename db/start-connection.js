const mongoose = require("mongoose");
const { username, password } = require("./mongodb-uri.json");
const dbUri =
  process.env.DATABASE_URI ||
  `mongodb+srv://${username}:${password}@test.cpnpkbx.mongodb.net/test`;

exports.connect = () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(
    dbUri,
    () => {
      console.log("Successfully connected!");
    },
    (e) => {
      console.log("Failed to connect");
      console.error(e.message);
    }
  );
};
