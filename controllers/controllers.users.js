const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler');
const User = require("../db/data/users");

const {
  createReview,
  findUserReviews,
  createUser,
  deleteReview,
  updateUserReview,
  removeUser,
  createOrder,
  findUserOrders,
  updateOrder,
  removeOrder,
  findUsers,
} = require("../models/models.users");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await findUsers();
    res.status(200).send({ users });
  } catch (e) {
    next(e);
  }
};

exports.postReview = async (req, res, next) => {
  try {
    const user = await createReview(req.body, req.params.user_id);
    res.status(201).send({ user });
  } catch (e) {
    next(e);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await findUserReviews(req.params.user_id);
    res.status(200).send({ reviews });
  } catch (e) {
    next(e);
  }
};

exports.patchUserReview = async (req, res, next) => {
  try {
    const review = await updateUserReview(
      req.params.user_id,
      req.params.review_id,
      req.body
    );
    res.status(200).send({ review });
  } catch (e) {
    next(e);
  }
};

exports.removeReview = async (req, res, next) => {
  try {
    await deleteReview(req.params.user_id, req.params.review_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await findUserOrders(req.params.user_id);
    res.status(200).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await removeUser(req.params.user_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const orders = await createOrder(req.params.user_id, req.body);
    res.status(201).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.patchOrder = async (req, res, next) => {
  try {
    const orders = await updateOrder(
      req.params.user_id,
      req.params.order_id,
      req.body
    );
    res.status(200).send({ orders });
  } catch (e) {
    next(e);
  }
};

exports.removeOrder = async (req, res, next) => {
  try {
    await removeOrder(req.params.user_id, req.params.order_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { username, contact, firstName, lastName, address, avatarUrl, password } = req.body;


  if(!username || !contact.email || !password || !contact.phoneNumber) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  const userExists = await User.findOne({email: "contact.email"})

  if(userExists){
    res.status(400)
    throw new Error('User already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username: username,
    firstName: firstName,
    lastName: lastName,
    address: {
      addressLine: address.addressLine,
      postcode: address.postcode
    },
    contact: {
    phoneNumber: contact.phoneNumber,
    email: contact.email
    },
    password: hashedPassword,
    reviews: [],
    avatarUrl:avatarUrl
  })

  if(user) {
    res.status(201).send({ username: user.username, _id: user._id, token: generateToken(user._id) })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({"contact.email": email})

  if(user && (await bcrypt.compare(password, user.password))){
    res.status(201).send({
      _id: user._id,
      username: user.username,
      email: user.contact.email,
      token: generateToken(user._id)
  });
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

exports.getUser = asyncHandler(async (req, res, next) => {
  const { _id, username, contact } = await User.findById(req.user.id)

  res.status(201).send({
    _id: _id,
    username: username,
    email: contact.email
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}