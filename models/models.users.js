const User = require("../db/data/users");

exports.findUserReviews = async (id) => {
  const user = await User.find({_id:id});
  return user[0].reviews;
};
