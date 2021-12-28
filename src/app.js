const express = require("express");
require('dotenv').config();
// const session = require('express-session');
const passport = require('passport');

const path = require("path");
const cookieParser = require("cookie-parser");

// Mongo conn
require("./db/conn");

// init app
const app = express();

// view engine
app.set("views", path.join(__dirname,"../views"));
app.set('view engine','ejs');

// static path
app.use(express.static(path.join(__dirname,"../public")));

//set global errors var
app.locals.errors=null;

//get all pages to pass to header.ejs
const Contact = require('./models/contactDetailModel');
Contact.findOne({}, function(err,contact){
    if(err){
        console.log(err);
    }else{
        app.locals.contact = contact;
    }
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET));

// session
// const { body } = require('express-validator');
// app.use(session({
app.use(require('cookie-session')({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    // cookie:{
    //     httpOnly: true,
    //     secure: false,  // true for https
    //     // expires: new Date(Date.now()+ 60*60*1000)
    // }
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// require passport
require('./helpers/googleAuth')

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// contact details
// const Contact = require('./models/contactDetailModel');
// app.all('*', async (req, res, next) => {
//     let t1 = new Date()
//     const contact = await Contact.findOne()
//     let t2 = new Date()
//     console.log(t2-t1);
//     req.contact = contact;
//     next();
// });

// Routes
app.use('/admin/category', require('./routes/adminCategories'));
app.use('/admin/subcategory', require('./routes/adminSubCategories'));
app.use('/admin/unit', require('./routes/adminUnit'));
app.use('/admin/newsletter', require('./routes/adminNewsletter'));
app.use('/admin/user', require('./routes/adminUserRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/admin', require('./routes/adminPagesRoutes'));
app.use('/admin', require('./routes/adminVendor'));

app.use('/vendor/product', require('./routes/vendorProducts'));
app.use('/vendor/offer', require('./routes/vendorOffers'));
app.use('/vendor', require('./routes/vendorRoutes'));

app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/cmsPages'));
app.use('/', require('./routes/accountRoutes'));
app.use('/', require('./routes/messageRoutes'));
app.use('/wishlist', require('./routes/wishlistRoutes'));
app.use('/newsletter', require('./routes/newsletterRoutes'));

app.use('/google', require('./routes/googleAuthRoutes'));

app.get("/",(req,res)=>{
    res.render("index",{
        title:  "Home"
    });
});

// 404
app.all('/404', (req, res, next) => {
    res.render("error",{
        title:  "404 | Not Found"
    });
});
app.all('*', (req, res, next) => {
    console.log(req.url);
    res.redirect('/404')
});

// error handler
app.use((err, req, res, next) =>{
    console.log(err);
    res.status(err.status || 500).json({
        status: "fail",
        message: err.message,
    })
})

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})

// NOTE

// REPORT


// All offers
// edit offer view
// edit offer api
// delete offer

// (admin)all products and delete product
// (admin)all offers and delete offer
// casterror handling
// vendors page(ongoing)
// add vendor page
// add vendor api


// TODO
// offer model
// subcat in product