const User = require("../db/data/users");

exports.findUserReviews = async (id) => {
   const reviews = await User.find({reviews: {_id: id}});
   return reviews;
 };