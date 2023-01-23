const express = require("express");
const {
  getTechnicians,
  createTechnician,
} = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);
app.post("/api/technicians", createTechnician);

module.exports = app;
