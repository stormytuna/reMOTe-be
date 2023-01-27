const mongoose = require("mongoose");

let username;
let password;
let dbUri;

if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  username = process.env.MONGODB_USERNAME;
  password = process.env.MONGODB_PASSWORD;
  dbUri = `mongodb+srv://${username}:${password}@prod.ko0v9jw.mongodb.net/test`;
} else {
  const { username, password } = require("./mongodb-uri.json");
  dbUri = `mongodb+srv://${username}:${password}@test.cpnpkbx.mongodb.net/test`;
}

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
