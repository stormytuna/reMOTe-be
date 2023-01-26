const User = require("../db/data/users");

exports.findUserReviews = async (id) => {
  const user = await User.findById(id);

  // Handle 404s
  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return user.reviews;
};

exports.deleteReview = async (user_id, review_id) => {

  const user = await User.findById(user_id);
  const review = await User.findOne({[`reviews._id`]: review_id}, {'reviews._id': 1})

  if (!user || !review) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }
  

  await User.findOneAndUpdate({ _id: user_id }, { $pull: { "reviews": { _id: review_id } } });
}