const ProductService = require("../services/product-service");

module.exports = (app) => {
    const service = new ProductService
    app.use("/app-events", async (req, res, next) => {
        const { payload } = req.body;
        // service.SubscribeEvents(payload)
        console.log("*******product service recovered event******")
        return res.status(200).json(payload)

    })
}