const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    collectionName: String,
    imageUrl: String,
    stockQuantity: Number, // Ensure this field is present
    details: String,
    //More Images
    //Sizing
    //Size Chart (drop down menu with + to add more?)
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
