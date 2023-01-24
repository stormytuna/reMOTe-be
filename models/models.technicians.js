const User = require("../db/data/users");

exports.findTechnicians = async () => {
    const technicians = await User.find({ "technician.services": { $ne: [] } });
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

exports.updateTechnician = async (id, updates) => {
    await User.findOneAndUpdate({_id: id}, { $push: {"technician.services": updates} })
    return await User.findById(id);
}