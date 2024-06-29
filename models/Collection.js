const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  coverPhoto: String,
  textColor: String,
  backgroundColor: String,
  imagePosition: { type: String, enum: ['left', 'right'], default: 'left' }
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
