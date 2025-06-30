const { CustomerModel, ProductModel, OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError } = require('../../utils/app-errors');
const { STATUS_CODES } = require('../../utils/app-errors');  // Assuming you have this constant in app-errors.js

class ShoppingRepository {

    // Get Orders for a Customer
    async Orders(customerId) {
        try {
            const orders = await OrderModel.find({ customerId });
            if (!orders) {
                throw new APIError('Orders Not Found', STATUS_CODES.NOT_FOUND, 'No orders found for this customer');
            }
            return orders;
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to fetch orders', true, err.stack);
        }
    }

    // Get Cart for a Customer
    async Cart(customerId) {
        try {
            const cart = await CartModel.findOne({ customerId });
            console.log({ cart })
            if (!cart) {
                throw new APIError('Cart Not Found', STATUS_CODES.NOT_FOUND, 'No cart found for this customer');
            }
            return cart;
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to fetch cart', true, err.stack);
        }
    }

    // Add or Remove Cart Item
    async AddCartItem(customerId, item, qty, isRemove) {
        try {
            const cart = await CartModel.findOne({ customerId });
            if (!cart) {
                // Create a new cart if none exists
                return await CartModel.create({
                    customerId,
                    items: [{ product: item, unit: qty }]
                });
            }

            let isExist = false;
            let cartItems = cart.items.map((cartItem) => {
                if (cartItem.product._id.toString() === item._id.toString()) {
                    isExist = true;
                    if (isRemove) {
                        return null;  // Mark the item for removal
                    } else {
                        cartItem.unit = qty;  // Update the unit if it's not to be removed
                    }
                }
                return cartItem;
            }).filter(Boolean);  // Remove null items if any

            if (!isExist && !isRemove) {
                cartItems.push({ product: item, unit: qty });
            }

            cart.items = cartItems;
            return await cart.save();
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to modify cart', true, err.stack);
        }
    }

    // Create a New Order
    async CreateNewOrder(customerId, txnId) {
        try {
            const cart = await CartModel.findOne({ customerId });
            if (!cart || cart.items.length === 0) {
                throw new BadRequestError('No items in the cart to create an order');
            }

            const amount = cart.items.reduce((acc, item) => acc + parseInt(item.product.price) * parseInt(item.unit), 0);

            const orderId = uuidv4();
            const order = new OrderModel({
                orderId,
                customerId,
                amount,
                txnId,
                status: 'received',
                items: cart.items
            });

            // Clear the cart after placing the order
            cart.items = [];
            await cart.save();

            return await order.save();  // Save the order and return it
        } catch (err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to create order', true, err.stack);
        }
    }
}

module.exports = ShoppingRepository;
