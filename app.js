const express = require("express");
require("dotenv").config();
const { getApi } = require("./controllers/controllers.api");
const { protect } = require('./controllers/authMiddleware');
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
  getUsers,
  registerUser,
  loginUser,
  getUser
} = require("./controllers/controllers.users");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api", getApi);
app.get("/api/technicians", getTechnicians);
app.get("/api/technicians/:user_id", getTechnician);
app.patch("/api/technicians/:user_id", patchTechnician);
app.post("/api/technicians", createTechnician);
app.post("/api/technicians/:user_id/reviews", createReviewforTech);
app.delete("/api/technicians/:user_id", deleteTechnician);
app.delete("/api/technicians/:user_id/reviews/:review_id", removeTechReview);

app.get("/api/users", getUsers);
app.get("/api/users/:user_id/reviews", getUserReviews);
app.get("/api/users/:user_id/orders", getUserOrders);
app.patch("/api/users/:user_id/reviews/:review_id", patchUserReview);
app.patch("/api/users/:user_id/orders/:order_id", patchOrder);
app.post("/api/users/:user_id/reviews", postReview);
app.post("/api/users/:user_id/orders", postOrder);
app.delete("/api/users/:user_id", deleteUser);
app.delete("/api/:user_id/reviews/:review_id", removeReview);
app.delete("/api/users/:user_id/orders/:order_id", removeOrder);

app.post("/api/users/register", registerUser);
app.post("/api/login", loginUser);
app.get('/api/user', protect, getUser);



app.use(handleCustomErrors);
app.use(handleMongoDBErrors);
app.all("*", handle404s);
app.use(handle500s);

module.exports = app;
