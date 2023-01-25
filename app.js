const express = require("express");
const {
  handleCustomErrors,
  handleMongoDBErrors,
  handle404s,
  handle500s,
} = require("./controllers/controllers.errors");

const {
  createTechnician,
  getTechnicians,
  getTechnician,
  createReviewforTech,
  patchTechnician,
} = require("./controllers/controllers.users");

const { getUserReviews } = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);

app.post("/api/technicians", createTechnician);

app.get("/api/technicians/:user_id", getTechnician);

app.get("/api/users/:user_id/reviews", getUserReviews);

app.post("/api/technicians/:user_id/reviews", createReviewforTech);

app.patch("/api/technicians/:user_id", patchTechnician);

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use(handle500s);

module.exports = app;
