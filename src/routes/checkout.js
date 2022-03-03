const express = require('express');
const router = express.Router();
const checkUser = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// GET checkout
router.get("/", checkUser, async (req,res) => {
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id });
        var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    var myCart = [];
    for (let i = 0; i < cart.products.length; i++) {
        var prod = await Product.findById(cart.products[i].productId);
        prod.quantity = cart.products[i].quantity;
        myCart.push(prod);
    }
    res.status(201).render("checkout",{
        title: 'Checkout',
        user: req.user,
        cartLength,
        myCart
    });
});

router.post("/", [
    check('phone','Please enter Phone number!').notEmpty(),
    check('house','Please enter House number!').notEmpty(),
    check('apartment','Please enter Apartment!').notEmpty(),
    check('landmark','Please enter Landmark!').notEmpty(),
    check('city','Please enter City!').notEmpty(),
    check('state','Please enter State!').notEmpty(),
    check('country','Please enter Country!').notEmpty(),
    check('postal','Please enter Postal code!').isNumeric()
  ], checkUser, async (req, res, next) => {
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const user = req.user;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            var myCart = [];
            for (let i = 0; i < cart.products.length; i++) {
                var prod = await Product.findById(cart.products[i].productId);
                prod.quantity = cart.products[i].quantity;
                myCart.push(prod);
            }
            const alert = validationErrors.array()
            return res.render('checkout', {
                title: 'Checkout',
                alert,
                cartLength,
                user,
                myCart
            })
        }
        user.phone = req.body.phone;
        user.address = {
            house: req.body.house,
            apartment: req.body.apartment,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            postal: req.body.postal
        }
        await user.save();
        req.flash('success',"Address changed successfully.")
        res.redirect('/checkout');
    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
})

module.exports = router;