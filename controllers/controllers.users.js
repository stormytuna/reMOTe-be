const { createReview, findUserReviews, updateUserReview } = require("../models/models.users");


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

exports.patchUserReview = async ( req, res, next) => {
  try {
    const review = await updateUserReview(req.params.user_id, req.params.review_id, req.body)
    res.status(200).send({ review })
  } catch (e) {
    next (e);
  };
};