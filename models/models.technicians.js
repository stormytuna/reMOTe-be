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
