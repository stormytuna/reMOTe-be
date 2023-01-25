exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handleMongoDBErrors = (err, req, res, next) => {
  if (err.name === "CastError") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.reason.toString().startsWith("BSONTypeError:")) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Content not found" });
};

exports.handle500s = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
};
