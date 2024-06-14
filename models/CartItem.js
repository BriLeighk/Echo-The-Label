const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
