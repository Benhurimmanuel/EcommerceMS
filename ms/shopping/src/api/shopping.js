const ShoppingService = require("../services/shopping-service");
const UserAuth = require("./middlewares/auth");
const { PublishCustomerEvent } = require("../utils");

module.exports = (app) => {
    const service = new ShoppingService();

    // Place a new order
    app.post('/order', UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        const { txnNumber } = req.body;

        try {
            const { data } = await service.placeOrder({ _id, txnNumber });
            const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');
            PublishCustomerEvent(payload);
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    });

    // Get order history
    app.get('/orders', UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        try {
            const { data } = await service.getOrders(_id);
            return res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    });

    // Get current cart
    app.get('/cart', UserAuth, async (req, res, next) => {

        const { _id } = req.user;

        const { data } = await service.GetCart({ _id });
        console.log({ data, _id })
        return res.status(200).json(data);
    });

    app.get('/whoami', (req, res, next) => {
        return res.status(200).json({ msg: '/shoping : I am Shopping Service' })
    })
};
