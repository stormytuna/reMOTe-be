exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handleMongoDBErrors = (err, req, res, next) => {
  // Add mongodb error codes here
  const castError = err.name === "CastError";
  const failedValidation = err._message === "User validation failed";
  const invalidId = ("" + err.reason).startsWith("BSONTypeError:");
  if (failedValidation || invalidId || castError) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Content not found" });
};

exports.handle500s = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal server error" });
};
