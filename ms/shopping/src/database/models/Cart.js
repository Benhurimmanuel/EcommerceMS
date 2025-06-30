const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartSchema = new Schema({
    customerId: { type: String, required: true },
    items: [
        {
            product: {
                _id: { type: String, required: true },
                name: { type: String },
                desc: { type: String },
                banner: { type: String },
                type: { type: String },
                unit: { type: Number },
                price: { type: Number },
                supplier: { type: String }, // fixed typo
            },
            unit: { type: Number, required: true },
        },
    ],
});

module.exports = mongoose.model('Cart', CartSchema);
