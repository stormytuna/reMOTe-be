const {
  findTechnicians,
  findTechnician,
  updateTechnician,
} = require("../models/models.technicians");

exports.getTechnicians = async (req, res, next) => {
  try {
    const technicians = await findTechnicians();
    res.status(200).send({ technicians });
  } catch (e) {
    next(e);
  }
};

exports.getTechnician = async (req, res, next) => {
  try {
    const technician = await findTechnician(req.params.user_id);
    res.status(200).send({ technician });
  } catch (e) {
    next(e);
  }
};

exports.patchTechnician = async (req, res, next) => {
  const updates = req.body;
  const id = req.params.user_id;
  try {
    await updateTechnician(id, updates)
    const updatedTechnician = await findTechnician(id);
    res.status(200).send(updatedTechnician)
  } catch (e){
    next(e);
  }
};
