const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const { APIError } = require('../utils/app-errors');

class ProductService {

    constructor() {
        this.repository = new ProductRepository();
    }

    async CreateProduct(productInputs) {
        try {
            const productResult = await this.repository.CreateProduct(productInputs);
            return FormateData(productResult);
        } catch (err) {
            throw new APIError('API Error', 500, 'Failed to create product');
        }
    }

    async GetProducts() {
        try {
            const products = await this.repository.Products();

            const categories = {};
            products.forEach(({ type }) => {
                categories[type] = type;
            });

            return FormateData({
                products,
                categories: Object.keys(categories),
            });
        } catch (err) {
            throw new APIError('API Error', 500, 'Unable to fetch products');
        }
    }

    async GetProductDescription(productId) {
        try {
            const product = await this.repository.FindById(productId);
            return FormateData(product);
        } catch (err) {
            throw new APIError('API Error', 500, 'Product description not found');
        }
    }

    async GetProductsByCategory(category) {
        try {
            const products = await this.repository.FindByCategory(category);
            return FormateData(products);
        } catch (err) {
            throw new APIError('API Error', 500, 'Category products not found');
        }
    }

    async GetSelectedProducts(selectedIds) {
        try {
            const products = await this.repository.FindSelectedProducts(selectedIds);
            return FormateData(products);
        } catch (err) {
            throw new APIError('API Error', 500, 'Failed to fetch selected products');
        }
    }

    async GetProductById(productId) {
        try {
            const product = await this.repository.FindById(productId);
            return product;
        } catch (err) {
            throw new APIError('API Error', 500, 'Product not found');
        }
    }

    async GetProductPayload(userId, { productId, qty }, event) {
        try {
            const product = await this.repository.FindById(productId);
            if (!product) {
                throw new APIError('Product Error', 404, 'Product not found');
            }

            const payload = {
                event,
                data: { userId, product, qty }
            };

            return FormateData(payload);
        } catch (err) {
            throw new APIError('API Error', 500, err.message || 'Failed to build product payload');
        }
    }
}

module.exports = ProductService;
