const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
  title: {
    type: String,
    required: true

  },
  description: {
    type: String,
    required: true

  },
//   postBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'users'
// },
  userName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  // array of objects which is of mixed datatype
  files: {
    type: [Schema.Types.Mixed]
  },
  date: {
    type: Date,
    default: Date.new
  }
})

mongoose.model('posts', PostSchema);
