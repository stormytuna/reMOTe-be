const express = require("express");
const { getTechnicians } = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.use("/api/technicians", getTechnicians);

module.exports = app;
