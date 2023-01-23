const { findTechnicians } = require("../models/models.technicians");

exports.getTechnicians = async (req, res, next) => {
  try {
    const technicians = await findTechnicians();
    res.status(200).send({ technicians });
  } catch (e) {
    next(e);
  }
};
