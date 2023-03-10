const User = require("../db/data/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const {
  patchKeysAreEqual,
  isValidId,
  badRequestError,
  contentNotFoundError,
} = require("../utils");

exports.findUsers = async () => {
  return await User.find({ technician: { $eq: null } });
};

exports.findUserById = async (id) => {
  // Handle 400s
  if (!isValidId(id)) {
    return badRequestError();
  }

  const user = await User.findOne({
    _id: { $eq: id },
    technician: { $eq: null },
  });

  // Handle 404s
  if (!user) {
    return contentNotFoundError();
  }

  return user;
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

  let reviews = user.reviews;

  reviews = await Promise.all(
    reviews.map(async (review) => {
      const clone = JSON.parse(JSON.stringify(review));
      const reviewee = await User.findOne({ _id: review.reviewedBy });

      delete clone.reviewedBy;
      clone.reviewee = {
        username: reviewee.username,
        name: `${reviewee.firstName} ${reviewee.lastName}`,
        avatarUrl: reviewee.avatarUrl,
      };

      return clone;
    })
  );

  return reviews;
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

exports.createUser = async (newUser) => {
  const {
    username,
    contact,
    firstName,
    lastName,
    address,
    avatarUrl,
    password,
  } = newUser;
  const expectedKeys = [
    "username",
    "firstName",
    "lastName",
    "address",
    "contact",
    "password",
    "avatarUrl",
  ];
  const receivedKeys = Object.keys(newUser);

  if (!patchKeysAreEqual(expectedKeys, receivedKeys)) {
    return badRequestError();
  }

  if (!username || !contact.email || !password || !contact.phoneNumber) {
    return badRequestError();
  }

  const userExists = await User.findOne({ email: "contact.email" });

  if (userExists) {
    return badRequestError();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username: username,
    firstName: firstName,
    lastName: lastName,
    address: {
      addressLine: address.addressLine,
      postcode: address.postcode,
    },
    contact: {
      phoneNumber: contact.phoneNumber,
      email: contact.email,
    },
    password: hashedPassword,
    reviews: [],
    avatarUrl: avatarUrl,
  });

  return {
    username: user.username,
    _id: user._id,
    token: generateToken(user._id),
  };
};

exports.login = async (userCreds) => {
  const { email, password } = userCreds;

  const user = await User.findOne({ "contact.email": email });

  if (user && (await bcrypt.compare(password, user.password))) {
    return {
      _id: user._id,
      username: user.username,
      email: user.contact.email,
      token: generateToken(user._id),
    };
  } else {
    return badRequestError();
  }
};

exports.findUser = async (id) => {
  const { _id, username, contact } = await User.findById(id);

  return {
    _id: _id,
    username: username,
    email: contact.email,
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
