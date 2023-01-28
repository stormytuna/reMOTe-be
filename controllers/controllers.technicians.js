const {
  findTechnicians,
  postTechnician,
  findTechnician,
  updateTechnicianProp,
  postReviewForTech,
  updateTechnician,
  removeTechReview,
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
    const user = await updateTechnicianProp(req.params.user_id);
    res.status(200).send({ user });
  } catch (e) {
    next(e);
  }
};

exports.patchTechnician = async (req, res, next) => {
  const updates = req.body;
  const id = req.params.user_id;
  try {
    const technician = await updateTechnician(id, updates);
    res.status(200).send({ technician });
  } catch (e) {
    next(e);
  }
};

exports.createReviewforTech = async (req, res, next) => {
  try {
    const technician = await postReviewForTech(req.params.user_id, req.body);
    res.status(201).send({ technician });
  } catch (e) {
    next(e);
  }
};

exports.removeTechReview = async (req, res, next) => {
  try {
    await removeTechReview(req.params.user_id, req.params.review_id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};
