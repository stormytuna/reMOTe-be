const { findUserReviews, deleteReview } = require("../models/models.users");

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await findUserReviews(req.params.user_id);
    res.status(200).send({ reviews });
  } catch (e) {
    next(e);
  }
};

exports.removeReview = async (req, res, next) => {
  try {
    await deleteReview(req.params.user_id, req.params.review_id)
    res.status(204).send()
  } catch (e) {
    next(e);
  }
}