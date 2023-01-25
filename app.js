const express = require("express");
const { getApi } = require("./controllers/controllers.api");
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
  deleteTechnician,
  createReviewforTech,
  patchTechnician,
} = require("./controllers/controllers.technicians");

const { getUserReviews } = require("./controllers/controllers.users");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);
app.post("/api/technicians", createTechnician);
app.patch("/api/technicians/:user_id", patchTechnician);
app.post("/api/technicians/:user_id/reviews", createReviewforTech);
app.delete("/api/technicians/:user_id", deleteTechnician);

app.get("/api/users/:user_id/reviews", getUserReviews);

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use(handle500s);

module.exports = app;
