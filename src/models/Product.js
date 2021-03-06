const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please enter a name'],
    },
    category: {
        type: String,
        required: [true, 'Please enter categories'],
    },
    protein: {
        type: Number,
        required: [true, 'Please enter protein'],
    },
    fat: {
        type: Number,
        required: [true, 'Please enter the fat'],
    },
    carbohydrates: {
        type: Number,
        required: [true, 'Please enter the carbohydrates'],
    },
    calories: {
        type: Number,
        required: [true, 'Please enter the calories'],
    },
    packaging: {
        type: String,
        required: [true, 'Please enter the packaging'],
    },

})

const Product = mongoose.model('product', productSchema)

module.exports = Product;

