const User = require("../db/data/users");

exports.findTechnicians = async () => {
    const technicians = await User.find({ "technician.services": { $ne: [] } });
    return technicians;
};

exports.findTechnician = async (id) => {
    const technician = await User.findById(id);
    return technician;
};

exports.updateTechnician = async (id, updates) => {
    await User.updateOne({_id: id}, { $set: {"technician.services": updates.services} })
    const updatedTechnician = await User.findById(id);
    return updatedTechnician;
}