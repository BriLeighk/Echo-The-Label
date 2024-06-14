const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    collectionName: { type: String },
    imageUrl: { type: String, required: true },
    inStock: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
