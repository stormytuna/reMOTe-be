const api = require("../db/data/api.json");

exports.getApi = (req, res, next) => {
  res.status(200).send({ api });
};
