const User = require("../db/data/users");

exports.findTechnicians = async () => {
  const technicians = await User.find({
    technician: { $ne: null },
  });
  return technicians;
};

exports.findTechnician = async (id) => {
  const technician = await User.findById(id);
  return technician;
};


exports.postTechnician = async (technician) => {
  if (technician.technician === null) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const newTechnician = await User.create(technician);
  return newTechnician;
};

exports.findTechnician = async (id) => {
  const technician = await User.findById(id);

  // Check 404s
  if (!technician) {
    return Promise.reject({ status: 404, msg: "Content not found" });
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
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return user;
};

exports.postReviewForTech = async (id, review) => {
  const { reviewBody, rating, reviewedBy, ...rest } = review;
  if (
    Object.keys(rest).length > 0 ||
    typeof reviewBody !== "string" ||
    typeof rating !== "number" ||
    typeof reviewedBy !== "number"
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  await User.findOneAndUpdate(
    { _id: id },
    { $push: { ["technician.reviews"]: review } }
  );
  return await User.findById({ _id: id });
};

exports.updateTechnician = async (id, updates) => {
  await User.findOneAndUpdate(
    { _id: id },
    { $push: { "technician.services": updates } }
  );
  const technician = await User.findById(id);

  // Handles 404s
  if (!technician) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }

  return technician;
};

exports.deleteReview = async (user_id, review_id) => {

  const user = await User.findById(user_id);
  const review = await User.findOne({[`reviews._id`]: review_id}, {'reviews._id': 1})

  if (!user || !review) {
    return Promise.reject({ status: 404, msg: "Content not found" });
  }
  

  await User.findOneAndUpdate({ _id: user_id }, { $pull: { "reviews": { _id: review_id } } });
}
