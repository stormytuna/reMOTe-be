const { createReview, findUserReviews, createUser } = require("../models/models.users");

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
exports.postUser = async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).send({ user });
  } catch (err) {
    next(err);
  }
};
