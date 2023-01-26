const app = require("./app");
const { connect } = require("./db/start-connection");
const { PORT = 9090 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
connect();
