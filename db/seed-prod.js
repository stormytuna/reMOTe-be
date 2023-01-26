const User = require("./data/users");
const { disconnect } = require("./end-connection");
const { connect } = require("./start-connection");
const prodData = require("./data/prod.json");

exports.seedProd = async () => {
  try {
    connect();
    await User.deleteMany({});
    await User.insertMany(prodData);
    disconnect();
  } catch (e) {
    console.error(e.message);
  }
};
this.seedProd();
