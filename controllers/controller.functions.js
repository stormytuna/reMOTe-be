const User = require("../db/data/users");


exports.patchKeysAreEqual = (providedKeys, expectedKeys) => {
    let correctKeys = false;
    for (let i = 0; i < expectedKeys.length; i++) {
    if (providedKeys[i] === expectedKeys[i]) return correctKeys = true;
    return correctKeys = false;
    }
    return correctKeys;
    }

exports.reviewCheck = async (user_id, review_id) => {
    const user = await User.findById(user_id);
    let result = '';
    user.reviews.forEach((review) => {
        if (review._id === review_id) return result = true
        return result = false;
    });
    return result;
}