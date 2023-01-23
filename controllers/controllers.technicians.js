const {
  findTechnicians,
  postTechnician,
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

    res.status(201).send(technician);
  } catch (err) {
    next(err);
  }
};
