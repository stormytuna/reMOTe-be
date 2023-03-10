const User = require("./data/users");
const { disconnect } = require("./end-connection");
const { connect } = require("./start-connection");
const testData = require("./data/test.json");

exports.seedTest = async () => {
  try {
    await User.deleteMany({});
    await User.insertMany(testData);
  } catch (e) {
    console.error(e.message);
  }
};
