const { CustomerModel, ProductModel, OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError } = require('../../utils/app-errors')


//Dealing with data base operations
class ShoppingRepository {

    // payment

    async Orders(customerId) {
        try {
            const orders = await OrderModel.find({ customerId });
            return orders;
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async Cart(customerId) {
        try {
            const orders = await CartModel.find({ customerId });
            return orders;
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
        async function AddCartItem(customerId, item, qty, isRemove) {
            try {
                const cart = await CartModel.findOne({ customerId });
                const { _id } = item;

                if (cart) {
                    let isExist = false;
                    let cartItems = cart.items;

                    if (cartItems.length > 0) {
                        cartItems = cartItems.map((cartItem) => {
                            if (cartItem.product._id.toString() === _id.toString()) {
                                isExist = true;
                                if (isRemove) {
                                    return null; // Mark for removal
                                } else {
                                    cartItem.unit = qty;
                                }
                            }
                            return cartItem;
                        }).filter(Boolean); // Remove null items
                    }

                    if (!isExist && !isRemove) {
                        cartItems.push({ product: item, unit: qty });
                    }

                    cart.items = cartItems;
                    return await cart.save();
                } else {
                    return await CartModel.create({
                        customerId,
                        items: [{ product: item, unit: qty }]
                    });
                }

            } catch (err) {
                throw new APIError(
                    "API Error",
                    STATUS_CODES.INTERNAL_ERROR,
                    "Unable to Modify Cart"
                );
            }
        }
    }
    async CreateNewOrder(customerId, txnId) {

        //check transaction for payment Status

        try {
            const profile = await CustomerModel.findById(customerId).populate('cart.product');

            if (profile) {

                let amount = 0;

                let cartItems = profile.cart;

                if (cartItems.length > 0) {
                    //process Order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) * parseInt(item.unit);
                    });

                    const orderId = uuidv4();

                    const order = new OrderModel({
                        orderId,
                        customerId,
                        amount,
                        txnId,
                        status: 'received',
                        items: cartItems
                    })

                    profile.cart = [];

                    order.populate('items.product').execPopulate();
                    const orderResult = await order.save();

                    profile.orders.push(orderResult);

                    await profile.save();

                    return orderResult;
                }
            }

            return {}

        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Category')
        }


    }
}

module.exports = ShoppingRepository;