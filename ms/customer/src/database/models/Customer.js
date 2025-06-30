const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    email: String,
    password: String,
    salt: String,
    phone: String,
    address: [
        { type: Schema.Types.ObjectId, ref: 'address', required: true }
    ],
    cart: [
        {
            product: {
                _id: { type: String, required: true },
                name: { type: String },
                banner: { type: String },
                price: { type: Number },
            },
            unit: { type: Number, required: true }
        }
    ],
    wishlist: [
        {
            _id: { type: String, required: true },
            name: { type: String },
            description: { type: String },
            banner: { type: String },
            available: { type: Boolean }, // fixed typo
            price: { type: Number },
        }
    ],
    orders: [
        {
            _id: { type: String, required: true },
            amount: { type: String },
            date: { type: Date, default: Date.now } // fixed default
        }
    ]
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);
