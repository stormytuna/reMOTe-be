const express = require("express");
const {
  handleCustomErrors,
  handle404s,
  handle500s,
  handleMongoDBErrors,
} = require("./controllers/controllers.errors");

const {
  createTechnician,
  getTechnicians,
  getTechnician,
} = require("./controllers/controllers.technicians");
const { postReview } = require("./controllers/controllers.users");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);

app.post("/api/technicians", createTechnician);

app.get("/api/technicians/:user_id", getTechnician);

app.post("/api/users/:user_id/reviews", postReview);

app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use("/*", handle404s);
app.use(handle500s);

module.exports = app;
