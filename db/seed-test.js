const User = require("./data/users");

exports.seed = async (data) => {
  try {
    await User.deleteMany({});
    await User.insertMany(data);
  } catch (e) {
    console.error(e.message);
  }
};
