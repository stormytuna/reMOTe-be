const User = require("../db/data/users");

exports.findUserReviews = async (id) => {
  const user = await User.findById(id);

  // Handle 404s
  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return user.reviews;
};
