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
  deleteTechnician,
  createReviewforTech,
  patchTechnician,
  removeReview
} = require("./controllers/controllers.technicians");

const app = express();

app.use(express.json());

app.get("/api/technicians", getTechnicians);

app.post("/api/technicians", createTechnician);

app.get("/api/technicians/:user_id", getTechnician);

app.delete("/api/technicians/:user_id", deleteTechnician);

app.post("/api/technicians/:user_id/reviews", createReviewforTech);

app.patch("/api/technicians/:user_id", patchTechnician);

app.delete("/api/:user_id/reviews/:review_id", removeReview);

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.use(handle500s);

module.exports = app;
