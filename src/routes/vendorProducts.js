const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer  = require('multer');
const fs = require('fs-extra');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/product/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

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

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Unit = require('../models/unitModel');
const Product = require('../models/productModel');

// GET products
router.get("/", async (req,res)=>{
    const products = await Product.find();
    res.status(201).render("vendor/vendor_products", {
        title: 'Product List',
        products
    });
});

// GET add product
router.get("/add", async (req,res)=>{
    const cats = await Category.find();
    let array = {}
    for (let i = 0; i < cats.length; i++) {
        const subcats = await Subcategory.find({category: cats[i].id});
        array[cats[i].id] = subcats
    }
    // const subcats = await Subcategory.find();
    const units = await Unit.find();
    res.status(201).render("vendor/add_product", {
        title: 'Add Product',
        cats,
        // subcats,
        units,
        array : array
    });
});

// add new product
router.post("/add", upload.single('image'), [
    check('category','Please enter category.').notEmpty(),
    check('productName','Please enter productName.').notEmpty(),
    check('type','Please enter valid type.').notEmpty(),
    check('costPrice','Please enter valid costPrice.').notEmpty(),
    check('salePrice','Please enter valid salePrice.').notEmpty(),
  ], async (req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('vendor/add_products', {
                title: 'Add Product',
                alert
            })
        }
        const image = req.file.path.replace(/\\/g,"/").replace('public','');
        const product = new Product({
            category : req.body.category,
            subcategory : req.body.subCategory,
            company : req.body.company,
            productname : req.body.productName,
            type : req.body.type,
            productweight : req.body.productWeight,
            unit : req.body.unit,
            costprice : req.body.costPrice,
            saleprice : req.body.salePrice,
            totalprice : req.body.totalPrice,
            image : image,
            title1 : req.body.title1,
            title2 : req.body.title2,
            title3 : req.body.title3,
            title4 : req.body.title4,
            description1 : req.body.description1,
            description2 : req.body.description2,
            description3 : req.body.description3,
            description4 : req.body.description4,
        })
        await product.save();
        req.flash('success',`Product added successfully`);
        res.redirect('/vendor/product');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

// GET edit product
router.get("/edit/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        const cats = await Category.find();
        let array = {}
        for (let i = 0; i < cats.length; i++) {
            const subcats = await Subcategory.find({category: cats[i].id});
            array[cats[i].id] = subcats
        }
        const units = await Unit.find();
        res.status(201).render("vendor/edit_product", {
            title: 'Edit Product',
            product,
            cats,
            units,
            array : array
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Product not found!`);
            res.redirect('/vendor/product');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// POST edit product
router.post('/edit/:id', upload.single('image'), [
    check('category','Please enter category.').notEmpty(),
    check('productName','Please enter productName.').notEmpty(),
    check('type','Please enter valid type.').notEmpty(),
    check('costPrice','Please enter valid costPrice.').notEmpty(),
    check('salePrice','Please enter valid salePrice.').notEmpty(),
],async (req,res) => {
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('vendor/add_products', {
                title: 'Add Product',
                alert
            })
        }
        const id = req.params.id;
        const product = await Product.findById(id);
        product.category = req.body.category;
        product.subcategory = req.body.subCategory;
        product.company = req.body.company;
        product.productname = req.body.productName;
        product.type = req.body.type;
        product.productweight = req.body.productWeight;
        product.unit = req.body.unit;
        product.costprice = req.body.costPrice;
        product.saleprice = req.body.salePrice;
        product.totalprice = req.body.totalPrice;
        product.title1 = req.body.title1;
        product.title2 = req.body.title2;
        product.title3 = req.body.title3;
        product.title4 = req.body.title4;
        product.description1 = req.body.description1;
        product.description2 = req.body.description2;
        product.description3 = req.body.description3;
        product.description4 = req.body.description4;
        if (typeof req.file !== 'undefined') {
            oldImage = "public" + product.image;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const image = req.file.path.replace(/\\/g,"/").replace('public','');
            product.image = image;
        }
        await product.save();
        req.flash('success',`Product Edited successfully`);
        res.redirect('/vendor/product')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Product not found!`);
            res.redirect('/vendor/product');
        } else {
            console.log(error);
            res.send(error)
        }
    }   
});

// GET delete product
router.get("/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndRemove(id);
        image = "public" + product.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Product Deleted successfully`);
        res.redirect('/vendor/product')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Product not found!`);
            res.redirect('/vendor/product');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

//exports
module.exports = router;