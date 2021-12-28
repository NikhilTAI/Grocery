const mongoose = require('mongoose'); 

const offerSchema = new mongoose.Schema ({
    category: {
        type: String,
        required:true
    },
    subcategory: {
        type: String,
    },
    company: {
        type: String,
    },
    productname: {
        type: String,
        required:true
    },
    productweight: {
        type: String,
    },
    unit: {
        type: String,
    },
    type: {
        type: String
    },
    costprice: {
        type: String,
        required:true
    },
    saleprice: {
        type: String,
        required:true
    },
    discount: {
        type: String,
        required:true
    },
    totalprice: {
        type: String,
    },
    nondisc: {
        type: String,
    },
    image: {
        type: String
    },
    title1: {
        type:String
    },
    title2: {
        type:String
    },
    title3: {
        type:String
    },
    title4: {
        type:String
    },
    description1: {
        type:String
    },
    description2: {
        type:String
    },
    description3: {
        type:String
    },
    description4: {
        type:String
    },
})

module.exports= new mongoose.model("Offer",offerSchema);;