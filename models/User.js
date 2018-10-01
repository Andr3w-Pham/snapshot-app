const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  googleID: {
    type: String

  },
  name: {
    type: String,
    required: true

  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: true

  },
  password: {
    type: String
  },
  date: {
    type: Date,
    default: Date.new
  },
  image: {
    type: String
  }
})

mongoose.model('users', UserSchema);
