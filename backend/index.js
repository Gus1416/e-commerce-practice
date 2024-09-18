const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

//Database connection with MongoDB
//mongoose.connect('mongodb+srv://guscalure43:j3PnBMXd7V_bECk@cluster0.ebojs.mongodb.net/e-commerce');
mongoose.connect('mongodb+srv://guscalure43:j3PnBMXd7V_bECk@cluster0.ebojs.mongodb.net/e-commerce')
    .then(() => console.log("Database connected"))
    .catch((err) => console.log("Error connecting to database", err));

//API Creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage:storage});

//Creating Upload Endpoint for Images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

//Schema for Creating Products
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    available: { type: Boolean, default: true }
});

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({}); //This is not efficient, better to use default MongoDB IDs 
    let id;
    if (products.length > 0) {  
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;  
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    console.log("Product added", product);
    await product.save();
    console.log("Product saved");
    res.json({
        success: true,
        name: req.body.name
    });
});

// Creating API for deleting products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Product removed");
    res.json({
        success: true,
        name: req.body.name
    });
});

//Creating API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
});

// Schema creating for User model
const User = mongoose.model('User', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now() },
});

// Creating endpoint for registering users
app.post('/signup', async (req, res) => {
    let check = await User.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ 
            success: false, 
            error: "existing user found with the same email address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0
    }
    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    })

    await user.save();

    const data = {
        user: { id: user.id }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({
        success: true, 
        token
    })
});

//Creating enpoint for user login
app.post('/login', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token })
        } else {
            res.json({ success: false, error: 'Wrong password'})
        } 
    } else {
        res.json({ success: false, error: 'Wrong email' })
    }
});

// Creating endpoint for new collection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newCollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newCollection);
});

// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: 'women' });
    let popularInWomen = products.slice(0, 4);
    console.log("Popular in women fetched");
    res.send(popularInWomen);
})

// creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: 'Please authentihgbjhgcate using valid token' })
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ error: 'please authenticate using a valid token'})
        }
    }
}

// Creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await User.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Added")
});

// Creating endpoint to remove from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed ", req.body.itemId)
    let userData = await User.findOne({_id: req.user.id});
    if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
    await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Added")
});

// creating enpoint for getting cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await User.findOne({_id: req.user.id});
    res.json(userData.cartData)
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port ", port);
    } else {
        console.log("Error: ", error);
    }
});