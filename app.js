const express = require("express");
const {
  handleCustomErrors,
  handle404s,
  handle500s,
} = require("./controllers/controllers.errors");
const {
  getTechnicians,
  getTechnician,
  patchTechnician,
} = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);

app.patch("/api/technicians/:user_id", patchTechnician)
app.use(handleCustomErrors);
app.use("/*", handle404s);
app.use(handle500s);

module.exports = app;
