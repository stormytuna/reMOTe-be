const User = require("../db/data/users");
const { patchKeysAreEqual } = require('../utils');

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
  const expectedKeys = ["reviewBody", "rating", "reviewedBy", "_id"]
  const receivedKeys = Object.keys(updates);

  const user = await User.findById({_id: user_id});
  const review = await User.find({'reviews': {$elemMatch: {_id: review_id}}})

  // Handle 404s
  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  if (review.length === 0) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  if (!patchKeysAreEqual(receivedKeys, expectedKeys)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  await User.findOneAndUpdate({'_id' : user_id}, { $set: {"reviews.$[elem].rating": rating, 'reviews.$[elem].reviewBody': reviewBody}}, {arrayFilters: [ {"elem._id": {$eq: review_id} }]})
  return await User.findById({_id: user_id});
};

exports.createUser = async (user) => {
  
  if (user.user === null) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const newUser = await User.create(user);
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
exports.removeUser = async (user_id) => {

  const user = await User.findById(user_id);

  if (!user) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  await User.remove({ _id: user_id})
}


exports.createOrder = async (user_id, order) => {
  const expectedKeys = ['services', 'createdAt', 'fulfilledAt', 'servicedBy']
  const receivedKeys = Object.keys(order)
  const user = await User.findById(user_id);

    if (!patchKeysAreEqual(receivedKeys, expectedKeys)){
      return Promise.reject({ status: 400, msg: "Bad request" });
    }

    if (!user) {
      return Promise.reject({ status: 404, msg: "Content not found" });
    }

    await User.findOneAndUpdate({ _id: user_id }, { $push: { orders: order } });
    const updatedUser = await User.findById({ _id: user_id });
    return updatedUser.orders;
};