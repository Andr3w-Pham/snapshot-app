// Custom function for truncate, strip tags and format date.
const moment= require("moment");
module.exports = {
  truncate: (str, len) => {
    // if the string passed is more than a defined length, only then truncate it
    if (str.length > 0 && str.length > len) {
      let new_str = str;
      new_str = str.substring(0, len);
      return new_str + "...";
    }
    return str;
  },
  // helper function to formate the date
  formatDate: (date, format) => {
    return moment(date).format(format);
  }
};