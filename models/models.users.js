const User = require("../db/data/users");
const { patchKeysAreEqual, reviewCheck } = require('../controllers/controller.functions');

exports.createReview = async (review, id) => {
  // Check for bad request
  const { reviewBody, rating, reviewedBy, ...rest } = review;
  if (
    Object.keys(rest).length > 0 ||
    typeof reviewBody !== "string" ||
    typeof rating !== "number" ||
    typeof reviewedBy !== "string"
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  // Actually do our patch
  await User.findOneAndUpdate({ _id: id }, { $push: { reviews: review } });
  const updatedUser = await User.findById({ _id: id });

  // Check for a 404
  if (!updatedUser) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return updatedUser;
};

exports.findUserReviews = async (id) => {
  const user = await User.findById(id);
  // Handle 404s
  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return user.reviews;
};

exports.updateUserReview = async (user_id, review_id, updates) => {
  const { rating, reviewBody } = updates;

  const user = await User.findById(user_id);


  // Handle 404s
  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  await User.findOneAndUpdate({'_id' : user_id}, { $set: {"reviews.$[elem].rating": rating, 'reviews.$[elem].reviewBody': reviewBody}}, {arrayFilters: [ {"elem._id": {$eq: review_id} }]})
  return await User.findById({_id: user_id});
};