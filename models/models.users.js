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

exports.createUser = async (user) => {
  
  if (user.user === null) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const newUser = await User.create(user);
  console.log(newUser)
  return newUser;
};
exports.deleteReview = async (user_id, review_id) => {

  const user = await User.findById(user_id);
  const review = await User.findOne({[`reviews._id`]: review_id}, {'reviews._id': 1})

  if (!user || !review) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }
  

  await User.findOneAndUpdate({ _id: user_id }, { $pull: { "reviews": { _id: review_id } } });
}
