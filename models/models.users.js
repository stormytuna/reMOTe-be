const User = require("../db/data/users");

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
  const dataToBeUpdated = {rating: rating, reviewBody: reviewBody}

  const userReview = await User.findOneAndUpdate({[`reviews._id`]: review_id}, { $set: {"reviews.$": dataToBeUpdated}});

  console.log(userReview);

  // { $set: {[`reviews.${review_id}`]: updates}}

};