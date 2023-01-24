const { createReview } = require("../models/models.users");

exports.postReview = async (req, res, next) => {
  try {
    const user = await createReview(req.body, req.params.user_id);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
};
