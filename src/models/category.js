const mongoose = require('mongoose');

//Category schema
const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required:true,
        unique:true
    },
    tax: {
        type: Number,
    },
    image:{
        type: String,
    },
    date:{
        type: Date,
        default: Date.now,
        required:true
    }
});

module.exports = mongoose.model('Category', CategorySchema);