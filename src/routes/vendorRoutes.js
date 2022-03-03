const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const { sendForgotPassMail } = require('../helpers/sendmail')
const { check, validationResult } = require('express-validator');
const sharp = require('sharp');
const multer  = require('multer');
const fs = require('fs-extra');

const checkVendor = require('../middleware/authVendorMiddleware');

const Vendor = require('../models/vendorModel');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// GET dashboard
// router.get("/",checkVendor, (req,res)=>{
router.get("/", (req,res)=>{
    res.status(201).render("vendor/vendor_dashboard", {
        title: 'Vendor Dashboard',
    });
});

// GET login
router.get('/login', (req, res)=>{
    res.render('vendor/login',{
        title: 'Vendor Login'
    })
})

// POST login
router.post("/login", [
    check('email','Please enter valid email.').isEmail(),
    check('password','Please enter password!').notEmpty(),
  ],async(req, res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/vendor/login');
        }
        const { email, password } = req.body;
        const vendorExist = await Vendor.findOne({email});
        if (!vendorExist) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/vendor/login');
        }
        const isMatch = await bcrypt.compare(password, vendorExist.password);
        if (!isMatch) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/vendor/login');
        }
        const token = await vendorExist.generateAuthToken();
        res.cookie("jwt", token, {
            expires:new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly:true,
            // secure:true
        });
        res.redirect('/vendor');
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
})

// GET register
router.get('/register', (req, res)=>{
    res.render('vendor/register',{
        title: 'Vendor Register'
    })
})

// POST register
router.post("/register", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'idImage', maxCount: 1 },
    { name: 'addImage', maxCount: 1 },
  ]), [
    check('storename','Please enter Store name.').notEmpty(),
    check('ownername','Please enter Owner name.').notEmpty(),
    check('email','Please enter valid email.').isEmail(),
    check('password','Password should be atleast 6 characters long.').isLength({ min: 6 }),
    check('contact','Plaese enter contact number.').notEmpty(),
    check('address','Plaese enter address.').notEmpty(),
  ],async(req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            console.log(alert);
            return res.render('vendor/register', {
                title: 'Vendor register',
                alert
            })
        }
        const vendorExist = await Vendor.findOne({email: req.body.email})
        if (vendorExist) {
            return res.render('vendor/register', {
                title: 'Vendor register',
                alert: [{msg:'Vendor is already registerd with this Email.'}]
            })
        }
        const file1name = new Date().toISOString().replace(/:/g, '-') + req.files.image[0].originalname;
        const file2name = new Date().toISOString().replace(/:/g, '-') + req.files.idImage[0].originalname;
        const file3name = new Date().toISOString().replace(/:/g, '-') + req.files.addImage[0].originalname;
        const vendor = new Vendor({
            storename : req.body.storename,
            ownername : req.body.ownername,
            email : req.body.email,
            password : req.body.password,
            contact : req.body.contact,
            address : req.body.address,
            deliverycharge : req.body.deliverycharge,
        })
        vendor.image = `/uploads/vendor/${vendor.id}/` + file1name;
        vendor.idimage = `/uploads/vendor/${vendor.id}/` + file2name;
        vendor.addressimage = `/uploads/vendor/${vendor.id}/` + file3name;

        fs.access('./public/uploads/vendor', (err) => { if (err) fs.mkdirSync('./public/uploads/vendor'); });
        fs.access(`./public/uploads/vendor/${vendor.id}`, (err) => { if (err) fs.mkdirSync(`./public/uploads/vendor/${vendor.id}`); });
        await sharp(req.files.image[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file1name);
        await sharp(req.files.idImage[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file2name);
        await sharp(req.files.addImage[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file3name);
        
        await vendor.save();
        req.flash('success','Vendor added successfully')
        res.redirect('/vendor/login');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

// GET Forgot Pass
router.get("/forgot", async (req, res) => {
    res.render("vendor/forgot",{
        title:  "Forgot Password"
    });
})

// POST Forgot Pass
router.post("/forgot", async (req, res, next) => {
    // generate pass
    let pass = (Math.random() + 1).toString(36).substring(5);
    
    // set pass
    const email = req.body.email
    console.log(email);
    const vendor = await Vendor.findOne({email});
    if (!vendor) {
        req.flash('danger','Please enter registered email id.');
        return res.redirect('/vendor/forgot');
    }
    vendor.password = pass;
    await vendor.save();
    
    // send mail
    sendForgotPassMail(email, pass)
    console.log('pass : '+ pass);
    
    req.flash('success','A new password sent to your mail. Check your mail and Try logging in.');
    return res.redirect('/vendor/forgot');
})

// GET orders
router.get("/orders", (req,res)=>{
    res.status(201).render("vendor/orders",{
        title: 'Order List',
    });
});

module.exports = router;