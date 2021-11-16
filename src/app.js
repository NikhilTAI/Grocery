require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const ejs = require('ejs');
// const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const createError = require('http-errors');

require("./db/conn");

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../views");
// const partials_path = path.join(__dirname,"../partials");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

// static path
app.use(express.static(static_path));

//view engine
app.set('view engine','ejs');
app.set("views",template_path);

// Routes
app.use('/', require('./routes/authRoutes'));

app.get("/",(req,res)=>{
    res.render("index",{
        title:  "Home"
    });
});
app.get("/account",(req,res)=>{
    res.render("account",{
        title:  "My Account"
    });
});

app.get("/secret",auth,(req,res)=>{
    console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret");
});

app.all('*', (req, res, next) => {
    next(createError.NotFound(`${req.originalUrl} not found!`))
});

// error handler
app.use((err, req, res, next) =>{
    res.status(err.status || 500).json({
        status: "fail",
        message: err.message,
    })
})

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
// change