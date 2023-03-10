const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../db/data/users");

const {
  createReview,
  findUserReviews,
  createUser,
  deleteReview,
  updateUserReview,
  removeUser,
  createOrder,
  findUserOrders,
  updateOrder,
  removeOrder,
  findUsers,
  login,
  findUserById,
} = require("../models/models.users");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await findUsers();
    res.status(200).send({ users });
  } catch (e) {
    next(e);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await findUserById(req.params.user_id);
    res.status(200).send({ user });
  } catch (e) {
    next(e);
  }
};

exports.postReview = async (req, res, next) => {
  try {
    const user = await createReview(req.body, req.params.user_id);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await findUserReviews(req.params.user_id);
    res.status(200).send({ reviews });
  } catch (e) {
    next(e);
  }
};

exports.patchUserReview = async (req, res, next) => {
  try {
    const review = await updateUserReview(
      req.params.user_id,
      req.params.review_id,
      req.body
    );
    res.status(200).send({ review });
  } catch (e) {
    next(e);
  }
};

exports.removeReview = async (req, res, next) => {
  try {
    await deleteReview(req.params.user_id, req.params.review_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await findUserOrders(req.params.user_id);
    res.status(200).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await removeUser(req.params.user_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const orders = await createOrder(req.params.user_id, req.body);
    res.status(201).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.patchOrder = async (req, res, next) => {
  try {
    const orders = await updateOrder(
      req.params.user_id,
      req.params.order_id,
      req.body
    );
    res.status(200).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.removeOrder = async (req, res, next) => {
  try {
    await removeOrder(req.params.user_id, req.params.order_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.registerUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await login(req.body);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
});

exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await findUser(req.user.id);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
});
