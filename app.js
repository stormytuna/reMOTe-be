const express = require("express");
const {
  getTechnicians,
  getTechnician,
} = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);

module.exports = app;
