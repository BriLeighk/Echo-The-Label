require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');

const User = require('./models/User');
const Collection = require('./models/Collection');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const CartItem = require('./models/CartItem');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URL, {});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { secure: false }, // set to true if using https
  })
);


const checkAuth = (req, res, next) => {
  console.log('Session data:', req.session);
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


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




//login modal functionality ///////////////////////////////////////////////////////////
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
    res.json({ success: true, redirectUrl: '/dashboard' }); //maybe change to /home
  }
});


//create account modal functionality ////////////////////////////////////////////////////
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
    res.json({ success: true, redirectUrl: '/login' }); //redirect user to login page
  } catch (error) {
    res.json({ success: false, message: 'Account already exists' });
  }
});


app.get('/dashboard', checkAuth, (req, res) => {
  const role = req.session.role;
  if (role === 'owner') {
    res.render('owner-dashboard');
  } else {
    res.render('dashboard');
  }
});


app.get('/partials/header', (req, res) => {
  res.render('partials/header');
});



//Backend Route for adding a collection ////////////////////////////////////////////////
app.post('/add-collection', checkAuth, async (req, res) => {
  const { name, description, backgroundColor } = req.body;
  const coverPhoto = req.file ? `/uploads/${req.file.filename}` : '';
  try {
    const collection = new Collection({ name, description, coverPhoto, backgroundColor });
    await collection.save();
    res.redirect('/owner-dashboard');
  } catch (error) {
    console.error('Error adding collection:', error);
    res.redirect('/owner-dashboard');
  }
});

//Backend Route for adding a product //////////////////////////////////////////////////
app.post('/add-product', checkAuth, upload.fields([{ name: 'imageUrl', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }]), async (req, res) => {
  const { name, description, details, price, category, collectionName, inStock } = req.body;
  const imageUrl = req.files['imageUrl'] ? `/uploads/${req.files['imageUrl'][0].filename}` : '';
  const additionalImages = req.files['additionalImages'] ? req.files['additionalImages'].map(file => `/uploads/${file.filename}`) : [];

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

    const uniqueAdditionalImages = [...new Set(additionalImages)];

    const product = new Product({ name, description, details, price, category: finalCategory, collectionName, imageUrl, additionalImages: uniqueAdditionalImages, stockQuantity: inStock });
    await product.save();
    const updatedCategories = await Category.find();

    console.log('Product added successfully. Returning updated categories:', updatedCategories);
    res.json({ success: true, product, categories: updatedCategories });
  } catch (error) {
    console.error('Error adding product:', error);
    res.json({ success: false, message: 'Error adding product' });
  }
});

app.post('/delete-category', checkAuth, async (req, res) => {
  const { categoryName } = req.body;
  try {
      // Find and delete the category
      const deletedCategory = await Category.findOneAndDelete({ name: categoryName });

      // If the category is not found, return an error
      if (!deletedCategory) {
          return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Remove the category from all products
      await Product.updateMany({ category: categoryName }, { $unset: { category: '' } });

      // Get updated categories
      const categories = await Category.find();

      res.json({ success: true, categories });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, message: 'Error deleting category' });
  }
});

app.post('/delete-image', checkAuth, async (req, res) => {
  const { productId, imageUrl } = req.body;
  
  try {
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Remove the image URL from the product's additionalImages array
      const updatedImages = product.additionalImages.filter(img => img !== imageUrl);
      product.additionalImages = updatedImages;
      await product.save();

      // Delete the image file from the filesystem
      const imagePath = path.join(__dirname, 'public', imageUrl);
      fs.unlink(imagePath, (err) => {
          if (err) {
              console.error('Error deleting image file:', err);
              return res.status(500).json({ success: false, message: 'Error deleting image file' });
          }
          res.json({ success: true, imageUrl });
      });
  } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ success: false, message: 'Error deleting image' });
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



// Shop Page ///////////////////////////////////////////////////////////////
app.get('/shop', async (req, res) => {
  try {
    const products = await Product.find(); //maybe remove exec();
    const categories = await Category.find(); // Fetch categories
    res.render('shop', { products, categories });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.render('error', { message: 'Error fetching shop' });
  }
});


app.get('/collections', async (req, res) => {
  try {
    const collections = await Collection.find().exec();
    res.render('collections', { collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.render('error', { message: 'Error fetching collections' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const category = req.query.category;
    let products;
    if (category && category !== 'all') {
      products = await Product.find({ category });
    } else {
      products = await Product.find();
    }
    console.log('Fetched products:', products); // Add this line
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});


// Delete product route (in Manage Products Tab - Owner Dashboard)
app.post('/delete-product', checkAuth, async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (product) {
      const imagePaths = [
        path.join(__dirname, 'public', product.imageUrl),
        ...product.additionalImages.map(img =>path.join(__dirname, 'public', img))
      ];

      imagePaths.forEach(imagePath => {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      });

          //Delete product from database
          
      await Product.deleteOne({ _id: productId });
    res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});


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

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});


// Define the route to get a product by ID
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

app.post('/edit-product/:id', checkAuth, upload.fields([{ name: 'edit-product-image', maxCount: 1 }, { name: 'editAdditionalImages', maxCount: 10 }]), async (req, res) => {
  const productId = req.params.id;
  const { 'edit-product-title': name, 'edit-product-description': description, 'edit-product-details': details, 'edit-product-price': price, 'edit-product-stock': stockQuantity } = req.body;
  const imageUrl = req.files['edit-product-image'] ? `/uploads/${req.files['edit-product-image'][0].filename}` : '';
  const additionalImages = req.files['editAdditionalImages'] ? req.files['editAdditionalImages'].map(file => `/uploads/${file.filename}`) : [];

  console.log('Received edit request for product:', productId);
  console.log('Update data:', { name, description, details, price, stockQuantity, imageUrl });
  console.log('Files received:', req.files);

  try {
    const updateData = { name, description, details, price, stockQuantity };

    if (imageUrl) {
      const product = await Product.findById(productId);
      if (product && product.imageUrl) {
        const oldImagePath = path.join(__dirname, 'public', product.imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err);
          } else {
            console.log('Old image deleted:', oldImagePath);
          }
        });
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

// Serve favicon.ico file
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
