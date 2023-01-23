const express = require("express");
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

module.exports = app;
