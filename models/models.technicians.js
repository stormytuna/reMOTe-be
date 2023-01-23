const User = require("../db/data/users");

exports.findTechnicians = async () => {
  try {
    const technicians = await User.find({ "technician.services": { $ne: [] } });
    return technicians;
  } catch (e) {
    console.error(e.message);
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

exports.updateTechnician = async (id, updates) => {
  try {
    await User.updateOne({_id: id}, { $set: {"technician.services": updates.services} })
    const updatedTechnician = await User.findById(id);
    return updatedTechnician;
  } catch (e) {
    console.error(e);
  }
}