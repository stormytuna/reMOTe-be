const User = require("../db/data/users");
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
  return technician;
};

exports.postTechnician = async (technician) => {
  if (technician.technician === null) {
    return badRequestError();
  }

  const newTechnician = await User.create(technician);
  return newTechnician;
};

exports.findTechnician = async (id) => {
  const technician = await User.findById(id);

  // Check 404s
  if (!technician) {
    return contentNotFoundError();
  }

  return technician;
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
