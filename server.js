require('dotenv').config();
console.log(process.env);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY); // Should log the actual secret access key
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fs = require('fs');
const path = require('path');
const app = express();

const { User, Collection, Product, Category, Order, CartItem } = require('./models');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URL, {});

// Verify that environment variables are loaded
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_REGION:", process.env.AWS_REGION);

// Access keys for connecting to image cloud storage (AWS)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
  },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { secure: false }, // set to true if using https
  })
);

// Authentication checking
const checkAuth = (req, res, next) => {
  console.log('Session data:', req.session);
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

// Routes for rendering pages and handling authentication
app.get('/', (req, res) => {
  res.render('index', { title: 'Start' });
});

app.get('/home-content', (req, res) => {
  res.render('home-content', { title: 'Home-Content' });
});

app.get('/home', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/api/check-login', (req, res) => {
  console.log('Check login session:', req.session);
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/partials/header', (req, res) => {
  res.render('partials/header');
});

app.get('/dashboard', checkAuth, (req, res) => {
  const role = req.session.role;
  if (role === 'owner') {
    res.render('owner-dashboard');
  } else {
    res.render('dashboard');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Failed to destroy session during logout:', err);
      return res.status(500).json({ success: false, message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.json({ success: true, redirectUrl: '/home' });
  });
});

// Login and account creation
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ email: username });

  if (!username || !password) {
    res.json({ success: false, message: 'Please fill out all fields.' });
  } else if (!user) {
    res.json({ success: false, message: 'No account linked to this email.' });
  } else if (!(await bcrypt.compare(password, user.password))) {
    res.json({ success: false, message: 'Incorrect password.' });
  } else {
    req.session.userId = user._id;
    req.session.role = user.role;
    res.json({ success: true, redirectUrl: '/dashboard' });
  }
});

app.post('/create-account', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    req.session.userId = newUser._id;
    req.session.role = newUser.role;
    res.json({ success: true, redirectUrl: '/login' });
  } catch (error) {
    res.json({ success: false, message: 'Account already exists' });
  }
});

// CRUD operations on collections
app.post('/add-collection', checkAuth, upload.single('coverPhoto'), async (req, res) => {
  const { name, description, textColor, backgroundColor, imagePosition } = req.body;
  const coverPhoto = req.file.location; // S3 URL

  try {
    const existingCollection = await Collection.findOne({ name });
    if (existingCollection) {
      return res.json({ success: false, message: 'A collection with this name already exists.' });
    }

    const collection = new Collection({ name, description, coverPhoto, textColor, backgroundColor, imagePosition });
    await collection.save();
    console.log('Collection added successfully');
    res.json({ success: true, collection });
  } catch (error) {
    console.error('Error adding collection:', error.message);
    res.json({ success: false, message: 'Error adding collection' });
  }
});

app.post('/delete-collection', checkAuth, async (req, res) => {
  const { collectionId } = req.body;
  try {
    const collection = await Collection.findByIdAndDelete(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.coverPhoto) {
      const coverPhotoKey = collection.coverPhoto.split('/').pop();
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: coverPhotoKey
      };
      await s3.send(new DeleteObjectCommand(params));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.json({ success: false, message: 'Error deleting collection' });
  }
});

// CRUD operations on products
app.post('/add-product', checkAuth, upload.fields([{ name: 'imageUrl', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res) => {
  const { name, description, details, price, category, collectionName, inStock } = req.body;
  const imageUrl = req.files['imageUrl'] ? req.files['imageUrl'][0].location : '';
  const additionalImages = req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.location) : [];

  let finalCategory = category;

  try {
    let existingCategory = await Category.findOne({ name: category });

    if (existingCategory) {
      finalCategory = existingCategory.name;
    } else {
      const newCategory = new Category({ name: category });
      await newCategory.save();
      finalCategory = newCategory.name;
    }

    const product = new Product({ name, description, details, price, category: finalCategory, collectionName, imageUrl, additionalImages, stockQuantity: inStock });
    await product.save();
    const updatedCategories = await Category.find();

    res.json({ success: true, product, categories: updatedCategories });
  } catch (error) {
    console.error('Error adding product:', error);
    res.json({ success: false, message: 'Error adding product' });
  }
});

app.post('/delete-image', async (req, res) => {
  const { imageUrl } = req.body;
  const imageKey = imageUrl.split('/').pop();

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageKey
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    res.send('Image deleted');
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).send('Error deleting image');
  }
});

app.post('/edit-product/:id', checkAuth, upload.fields([{ name: 'edit-product-image', maxCount: 1 }, { name: 'editAdditionalImages', maxCount: 10 }]), async (req, res) => {
  const productId = req.params.id;
  const { 'edit-product-title': name, 'edit-product-description': description, 'edit-product-details': details, 'edit-product-price': price, 'edit-product-stock': stockQuantity } = req.body;
  const imageUrl = req.files['edit-product-image'] ? req.files['edit-product-image'][0].location : '';
  const additionalImages = req.files['editAdditionalImages'] ? req.files['editAdditionalImages'].map(file => file.location) : [];

  console.log('Received edit request for product:', productId);
  console.log('Update data:', { name, description, details, price, stockQuantity, imageUrl });
  console.log('Files received:', req.files);

  try {
    const updateData = { name, description, details, price, stockQuantity };

    if (imageUrl) {
      const product = await Product.findById(productId);
      if (product && product.imageUrl) {
        const oldImageKey = product.imageUrl.split('/').pop();
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldImageKey
        };
        await s3.send(new DeleteObjectCommand(params));
      }
      updateData.imageUrl = imageUrl;
    }

    if (additionalImages.length > 0) {
      updateData.additionalImages = additionalImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    console.log('Product updated successfully');
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.json({ success: false, message: 'Error updating product' });
  }
});

// Category handling - CRUD operations
app.post('/delete-category', checkAuth, async (req, res) => {
  const { categoryName } = req.body;
  try {
    const deletedCategory = await Category.findOneAndDelete({ name: categoryName });

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Product.updateMany({ category: categoryName }, { $unset: { category: '' } });

    const categories = await Category.find();

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Error deleting category' });
  }
});

// Path to render shop page with products and categories loaded up
app.get('/shop', async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    res.render('shop', { products, categories });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.render('error', { message: 'Error fetching shop' });
  }
});

// Path to fetch collections (for collections list)
app.get('/api/collections', checkAuth, async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ success: false, message: 'Error fetching collections' });
  }
});

// Path to render collections page with collections loaded
app.get('/collections', checkAuth, async (req, res) => {
  try {
    const collections = await Collection.find();
    res.render('collections', { collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send('Error fetching collections');
  }
});

// Path to fetch products and handle search and filter functionality 
app.get('/api/products', async (req, res) => {
  try {
    const { category, collection, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (collection && collection !== 'all') {
      query.collectionName = collection;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Path to render the Owner Dashboard
app.get('/owner-dashboard', checkAuth, async (req, res) => {
  try {
    const categories = await Category.find();
    const collections = await Collection.find();
    const products = await Product.find();
    res.render('owner-dashboard', { categories, collections, products });
  } catch (error) {
    console.error('Error fetching collections and products:', error);
    res.render('error', { message: 'Error fetching data for owner dashboard' });
  }
});

// Path to fetch categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Path to delete an image
app.post('/delete-image', checkAuth, async (req, res) => {
  const { productId, imageUrl } = req.body;
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedImages = product.additionalImages.filter(img => img !== imageUrl);
    product.additionalImages = updatedImages;
    await product.save();

    const imageKey = imageUrl.split('/').pop();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageKey
    };

    await s3.send(new DeleteObjectCommand(params));
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

// Path to fetch a product by ID
app.get('/api/product/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

// Serve favicon.ico file
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
