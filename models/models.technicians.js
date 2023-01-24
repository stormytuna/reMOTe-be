const User = require("../db/data/users");

exports.findTechnicians = async () => {
  try {
    const technicians = await User.find({
      "technician.services": { $ne: null },
    });
    return technicians;
  } catch (e) {
    console.error(e.message);
  }
};

exports.postTechnician = async (technician) => {
  if (technician.technician === null) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const newTechnician = await User.create(technician);
  return newTechnician;
};

exports.findTechnician = async (id) => {
  try {
    const technician = await User.findById(id);
    return technician;
  } catch (e) {
    console.error(e);
  }
};
