const express = require("express");
const {
  handle404s,
  handleMongoDBErrors,
  handleCustomErrors,
  handle500s,
} = require("./controllers/controllers.errors");

const {
  createTechnician,
  getTechnicians,
  getTechnician,
  deleteTechnician,
  createReviewforTech,
  patchTechnician
} = require("./controllers/controllers.technicians");
const { postReview, patchUserReview } = require("./controllers/controllers.users");

const { getUserReviews } = require("./controllers/controllers.users");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);
app.post("/api/technicians", createTechnician);
app.patch("/api/technicians/:user_id", patchTechnician);
app.post("/api/technicians/:user_id/reviews", createReviewforTech);
app.delete("/api/technicians/:user_id", deleteTechnician);

app.post("/api/users/:user_id/reviews", postReview);
app.get("/api/users/:user_id/reviews", getUserReviews);
app.patch("/api/users/:user_id/reviews/:review_id", patchUserReview);

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use(handle500s);

module.exports = app;
