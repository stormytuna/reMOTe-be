const express = require("express");
const { getApi } = require("./controllers/controllers.api");
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
  patchTechnician,
  removeTechReview,
} = require("./controllers/controllers.technicians");

const cors = require("cors");

const {
  postReview,
  getUserReviews,
  postUser,
  removeReview,
  patchUserReview,
  deleteUser,
  postOrder,
  getUserOrders,
  patchOrder,
  removeOrder,
} = require("./controllers/controllers.users");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api", getApi);

app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);
app.post("/api/technicians", createTechnician);
app.patch("/api/technicians/:user_id", patchTechnician);
app.post("/api/technicians/:user_id/reviews", createReviewforTech);
app.delete("/api/technicians/:user_id", deleteTechnician);

app.post("/api/users/:user_id/reviews", postReview);
app.get("/api/users/:user_id/reviews", getUserReviews);
app.patch("/api/users/:user_id/reviews/:review_id", patchUserReview);

app.post("/api/users", postUser);
app.delete("/api/users/:user_id", deleteUser);

app.delete("/api/:user_id/reviews/:review_id", removeReview);
app.get("/api/users/:user_id/orders", getUserOrders);
app.post("/api/users/:user_id/orders", postOrder);

app.patch("/api/users/:user_id/orders/:order_id", patchOrder);

app.delete("/api/users/:user_id/orders/:order_id", removeOrder);

app.delete("/api/technicians/:user_id/reviews/:review_id", removeTechReview);

app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.all("*", handle404s);
app.use(handle500s);

module.exports = app;
