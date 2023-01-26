const User = require("./data/users");
const { disconnect } = require("./end-connection");
const { connect } = require("./start-connection");
const prodData = require("./data/prod.json");

exports.seedProd = async () => {
  try {
    connect();
    console.log("Seeding prod...");
    await User.deleteMany({});
    console.log("Deleted current data!");
    await User.insertMany(prodData);
    console.log(prodData);
    console.log("Added data from prodData!");
    disconnect();
  } catch (e) {
    console.error(e.message);
  }
};
