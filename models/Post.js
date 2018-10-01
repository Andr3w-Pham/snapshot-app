const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
  title: {
    type: String,
    

  },
  description: {
    type: String,
    

  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  // array of objects which is of mixed datatype
  files: [Schema.Types.Mixed],
  date: {
    type: Date,
    default: Date.new
  }
})

mongoose.model('posts', PostSchema);
