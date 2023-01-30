const User = require("../db/data/users");
const {
  patchKeysAreEqual,
  isValidId,
  badRequestError,
  contentNotFoundError,
} = require("../utils");

exports.findUsers = async () => {
  return await User.find({ technician: { $eq: null } });
};

exports.createReview = async (review, id) => {
  // Check for bad request
  const { reviewBody, rating, reviewedBy, ...rest } = review;
  if (
    Object.keys(rest).length > 0 ||
    typeof reviewBody !== "string" ||
    typeof rating !== "number" ||
    typeof reviewedBy !== "string"
  ) {
    return badRequestError();
  }

  // Actually do our patch
  await User.findOneAndUpdate({ _id: id }, { $push: { reviews: review } });
  const updatedUser = await User.findById({ _id: id });

  // Check for a 404
  if (!updatedUser) {
    return contentNotFoundError();
  }

  return updatedUser;
};

exports.findUserReviews = async (id) => {
  const user = await User.findById(id);
  // Handle 404s
  if (!user) {
    return contentNotFoundError();
  }

  return user.reviews;
};

exports.updateUserReview = async (user_id, review_id, updates) => {
  const { rating, reviewBody } = updates;
  const expectedKeys = ["reviewBody", "rating", "reviewedBy", "_id"];
  const receivedKeys = Object.keys(updates);

  const user = await User.findById({ _id: user_id });
  const review = await User.find({
    reviews: { $elemMatch: { _id: review_id } },
  });

  // Handle 404s
  if (!user) {
    return contentNotFoundError();
  }

  if (review.length === 0) {
    return contentNotFoundError();
  }

  if (!patchKeysAreEqual(receivedKeys, expectedKeys)) {
    return badRequestError();
  }

  await User.findOneAndUpdate(
    { _id: user_id },
    {
      $set: {
        "reviews.$[elem].rating": rating,
        "reviews.$[elem].reviewBody": reviewBody,
      },
    },
    { arrayFilters: [{ "elem._id": { $eq: review_id } }] }
  );
  return await User.findById({ _id: user_id });
};

exports.createUser = async (user) => {
  if (user.user === null) {
    return badRequestError();
  }
  const newUser = await User.create(user);
  return newUser;
};
exports.deleteReview = async (user_id, review_id) => {
  if (!isValidId(user_id) || !isValidId(review_id)) {
    return badRequestError();
  }

  const user = await User.findById(user_id);
  const review = await User.findOne(
    { [`reviews._id`]: review_id },
    { "reviews._id": 1 }
  );

  if (!user || !review) {
    return contentNotFoundError();
  }
  await User.findOneAndUpdate(
    { _id: user_id },
    { $pull: { reviews: { _id: review_id } } }
  );
};

exports.findUserOrders = async (user_id) => {
  const user = await User.findById(user_id);

  if (!user) {
    return contentNotFoundError();
  }
  return user.orders;
};

exports.removeUser = async (user_id) => {
  const user = await User.findById({ _id: user_id });

  if (!isValidId(user_id)) {
    return badRequestError();
  }

  if (!user) {
    return contentNotFoundError();
  }

  await User.remove({ _id: user_id });
};

exports.createOrder = async (user_id, order) => {
  const expectedKeys = ["services", "createdAt", "fulfilledAt", "servicedBy"];
  const receivedKeys = Object.keys(order);

  if (!patchKeysAreEqual(receivedKeys, expectedKeys)) {
    return badRequestError();
  }

  await User.findOneAndUpdate({ _id: user_id }, { $push: { orders: order } });

  const updatedUser = await User.findById({ _id: user_id });

  if (!updatedUser) {
    return contentNotFoundError();
  }

  return updatedUser.orders;
};

exports.updateOrder = async (user_id, order_id, updates) => {
  const { services } = updates;
  const expectedKeys = ["services"];
  const receivedKeys = Object.keys(updates);

  if (!patchKeysAreEqual(expectedKeys, receivedKeys)) {
    return badRequestError();
  }

  await User.findOneAndUpdate(
    { _id: user_id },
    { $set: { "orders.$[elem].services": services } },
    { arrayFilters: [{ "elem._id": { $eq: order_id } }] }
  );
  const user = await User.findById({ _id: user_id });

  if (!user) {
    return contentNotFoundError();
  }

  const order = await User.find({ orders: { $elemMatch: { _id: order_id } } });

  if (order.length === 0) {
    return contentNotFoundError();
  }

  return user.orders;
};

exports.removeOrder = async (user_id, order_id) => {
  if (!isValidId(user_id) || !isValidId(order_id)) {
    return badRequestError();
  }

  const order = await User.find({ orders: { $elemMatch: { _id: order_id } } });

  if (order.length === 0) {
    return contentNotFoundError();
  }

  await User.findOneAndUpdate(
    { _id: user_id },
    { $pull: { orders: { _id: order_id } } }
  );

  const user = await User.findById(user_id);

  if (!user) {
    return contentNotFoundError();
  }

  return user.orders;
};
