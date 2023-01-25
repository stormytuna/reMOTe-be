const express = require("express");
const {
  handleCustomErrors,
  handle404s,
  handle500s,
} = require("./controllers/controllers.errors");

const {
  createTechnician,
  getTechnicians,
  getTechnician,
  deleteTechnician,
} = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);

app.post("/api/technicians", createTechnician);

app.get("/api/technicians/:user_id", getTechnician);

app.delete("/api/technicians/:user_id", deleteTechnician);

app.use(handleCustomErrors);
app.use("/*", handle404s);
app.use(handle500s);

module.exports = app;
