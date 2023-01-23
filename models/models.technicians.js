const User = require("../db/data/users");

exports.findTechnicians = async () => {
  try {
    const technicians = await User.find({ "technician.services": { $ne: [] } });
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
