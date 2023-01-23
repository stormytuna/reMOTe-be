// Source: https://stackoverflow.com/questions/164979/regex-for-matching-uk-postcodes
exports.postcodeRegex =
  /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;

// Source: https://regexlib.com/Search.aspx?k=uk%20telephone
exports.phoneNumberRegex = /(((\+44)? ?(\(0\))? ?)|(0))( ?[0-9]{3,4}){3}/;
