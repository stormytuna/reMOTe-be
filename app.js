const express = require("express");
const {
  handleCustomErrors,
  handleMongoDBErrors,
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

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use(handle500s);

module.exports = app;
