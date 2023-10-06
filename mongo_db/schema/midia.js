
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const BlogPost = new Schema({
  message_id: ObjectId,
  url: String,
});


module.exports = mongoose.model('Midia', BlogPost);