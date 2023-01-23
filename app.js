const express = require("express");
const {
  handleCustomErrors,
  handle404s,
  handle500s,
} = require("./controllers/controllers.errors");
const { getTechnicians } = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.use("/api/technicians", getTechnicians);

app.use(handleCustomErrors);
app.use("/*", handle404s);
app.use(handle500s);

module.exports = app;
