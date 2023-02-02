const User = require("../db/data/users");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');
const {
  patchKeysAreEqual,
  badRequestError,
  contentNotFoundError,
} = require("../utils");

exports.findTechnicians = async (
  serviceFilter,
  sortBy = "rating",
  order = "asc"
) => {
  const validSortBys = ["rating", "reviews"];
  const validOrders = ["asc", "desc"];

  if (!validSortBys.includes(sortBy) || !validOrders.includes(order)) {
    return badRequestError();
  }

  let technicians = await User.find({
    technician: { $ne: null },
  });

  if (serviceFilter) {
    technicians = technicians.filter((technician) => {
      let matches = false;
      technician.technician.services.forEach((service) => {
        if (service.name.toLowerCase().includes(serviceFilter.toLowerCase())) {
          matches = true;
          return;
        }
      });
      return matches;
    });
  }

  technicians = technicians.sort((cur, pre) => {
    if (sortBy === "rating") {
      const curTotalRatings = cur.technician.reviews.reduce((pre, cur) => {
        return pre + cur.rating;
      }, 0);
      const curRating = curTotalRatings / cur.technician.reviews.length;

      const preTotalRatings = pre.technician.reviews.reduce((pre, cur) => {
        return pre + cur.rating;
      }, 0);
      const preRating = preTotalRatings / pre.technician.reviews.length;

      return preRating - curRating;
    } else if (sortBy === "reviews") {
      const curReviews = cur.technician.reviews.length;
      const preReviews = pre.technician.reviews.length;
      return preReviews - curReviews;
    }
  });

  if (sortBy === "desc") {
    technicians = technicians.reverse();
  }

  return technicians;
};

exports.findTechnician = async (id) => {
  const technician = await User.findById(id);

  if (!technician) {
    return contentNotFoundError();
  }

  // Hacky fix, need some more info for reviews on the front end but no GET /api/technicians/:user_id/reviews endpoint
  const newReviews = await Promise.all(
    technician.technician.reviews.map(async (review) => {
      const clone = JSON.parse(JSON.stringify(review));
      const reviewee = await User.findOne({ _id: clone.reviewedBy });

      delete clone.reviewedBy;
      clone.reviewee = {
        username: reviewee.username,
        name: `${reviewee.firstName} ${reviewee.lastName}`,
        avatarUrl: reviewee.avatarUrl,
      };

      return clone;
    })
  );

  const clone = JSON.parse(JSON.stringify(technician));
  delete clone.technician.reviews;
  clone.technician.reviews = newReviews;

  return clone;
};

exports.postTechnician = async (technician) => {
  if (technician.technician === null) {
    return badRequestError();
  }

  const newTechnician = await User.create(technician);
  return newTechnician;
};

exports.updateTechnicianProp = async (technicianID) => {
  await User.findOneAndUpdate(
    { _id: technicianID },
    {
      $set: { technician: null },
    }
  );

  const user = await User.findById(technicianID);
  // Handle 404s
  if (!user) {
    return contentNotFoundError();
  }

  return user;
};

exports.postReviewForTech = async (id, review) => {
  const { reviewBody, rating, reviewedBy, ...rest } = review;
  if (
    Object.keys(rest).length > 0 ||
    typeof reviewBody !== "string" ||
    typeof rating !== "number" ||
    typeof reviewedBy !== "string"
  ) {
    return badRequestError();
  }

  await User.findOneAndUpdate(
    { _id: id },
    { $push: { ["technician.reviews"]: review } }
  );
  return await User.findById({ _id: id });
};

exports.updateTechnician = async (id, updates) => {
  // Handles 400s
  if (!patchKeysAreEqual(Object.keys(updates), ["name", "price"])) {
    return badRequestError();
  }

  const aa = await User.findOneAndUpdate(
    { _id: id },
    { $push: { "technician.services": updates } }
  );
  const technician = await User.findById(id);

  // Handles 404s
  if (!technician) {
    return contentNotFoundError();
  }

  return technician;
};

exports.removeTechReview = async (user_id, review_id) => {
  const user = await User.findById(user_id);

  if (!user) {
    return contentNotFoundError();
  }

  const review = await User.find({
    "technician.reviews": { $elemMatch: { _id: review_id } },
  });

  if (review.length === 0) {
    return contentNotFoundError();
  }

  await User.findOneAndUpdate(
    { _id: user_id },
    { "technician.reviews": { $pull: { _id: review_id } } }
  );
};

exports.createTech = async (newTech) => {
  const {
    username,
    contact,
    firstName,
    lastName,
    address,
    avatarUrl,
    password,
    technician
  } = newTech;
  const expectedKeys = [
    "username",
    "firstName",
    "lastName",
    "address",
    "contact",
    "password",
    "avatarUrl",
    "technician"
  ];
  const receivedKeys = Object.keys(newTech);

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
    technician: {services:[...technician.services]},
    reviews: [],
    avatarUrl: avatarUrl,
  });

  return {
    username: user.username,
    _id: user._id,
    token: generateToken(user._id),
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};