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
  try {
    const newTechnician = await User.create(technician);
    return newTechnician;
  } catch (e) {
    console.error(e);
  }
};

exports.findTechnician = async (id) => {
  try {
    const technician = await User.findById(id);
    return technician;
  } catch (e) {
    console.error(e);
  }
};

exports.updateTechnicianProp = async (technicianID) => {
  await User.findOneAndUpdate(
    { _id: technicianID },
    {
      $set: { technician: null },
    }
  );
  const user = await User.findById(technicianID);
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
  return await User.findById(id);
};

exports.deleteReview = async (user_id, review_id) => {
  await User.findOneAndUpdate({ _id: user_id }, { $pull: { "reviews": { _id: review_id } } }, { new: true });
  const user = await User.findById({_id: user_id});
  return user;
}
