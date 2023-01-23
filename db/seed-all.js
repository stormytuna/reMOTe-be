const { seed } = require("./seed-test");
const { connect } = require("./start-connection");
const { disconnect } = require("./end-connection");
const userData = require("./data/users");

async function main() {
  connect();
  await seed(userData);
  disconnect();
}

main();
