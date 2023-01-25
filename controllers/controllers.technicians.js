const {
  findTechnicians,
  postTechnician,
  findTechnician,
  updateTechnicianProp,
} = require("../models/models.technicians");

exports.getTechnicians = async (req, res, next) => {
  try {
    const technicians = await findTechnicians();
    res.status(200).send({ technicians });
  } catch (e) {
    next(e);
  }
};

exports.createTechnician = async (req, res, next) => {
  try {
    const technician = await postTechnician(req.body);
    res.status(201).send({ technician });
  } catch (err) {
    next(err);
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

exports.deleteTechnician = async (req, res, next) => {
  try {
    const technician = await findTechnician(req.params.user_id);
    await updateTechnicianProp(technician);
    const downgradedTechnician = await findTechnician(req.params.user_id);

    res.status(200).send({ downgradedTechnician });
  } catch (e) {
    next(e);
  }
};
