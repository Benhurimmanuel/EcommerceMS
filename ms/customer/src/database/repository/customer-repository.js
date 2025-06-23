const { CustomerModel, AddressModel } = require("../models");
const {
  APIError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class CustomerRepository {
  async CreateCustomer({ email, password, phone, salt }) {
    try {
      const customer = new CustomerModel({
        email,
        password,
        salt,
        phone,
        address: [],
      });
      return await customer.save();
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async CreateAddress({ _id, street, postalCode, city, country }) {
    try {
      const profile = await CustomerModel.findById(_id);

      if (profile) {
        const newAddress = new AddressModel({
          street,
          postalCode,
          city,
          country,
        });

        await newAddress.save();

        profile.address.push(newAddress);
        return await profile.save();
      }

      throw new Error("Customer not found");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Address"
      );
    }
  }

  async FindCustomer({ email }) {
    try {
      return await CustomerModel.findOne({ email });
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async FindCustomerById({ id }) {
    try {
      return await CustomerModel.findById(id).populate("address");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async Wishlist(customerId) {
    try {
      const profile = await CustomerModel.findById(customerId).populate("wishlist");
      return profile.wishlist;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Wishlist"
      );
    }
  }

  async AddWishlistItem(customerId, { _id, name, desc, price, available, banner }) {
    const product = { _id, name, desc, price, available, banner };

    try {
      const profile = await CustomerModel.findById(customerId).populate("wishlist");

      if (profile) {
        const wishlist = profile.wishlist || [];
        const index = wishlist.findIndex(item => item._id.toString() === _id.toString());

        if (index > -1) {
          wishlist.splice(index, 1); // Remove item if exists
        } else {
          wishlist.push(product); // Add new item
        }

        profile.wishlist = wishlist;
        const profileResult = await profile.save();
        return profileResult.wishlist;
      }

      throw new Error("Customer not found");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Add to WishList"
      );
    }
  }

  async AddCartItem(customerId, { _id, name, price, banner }, qty, isRemove) {
    const product = { _id, name, price, banner };

    try {
      const profile = await CustomerModel.findById(customerId).populate("cart");

      if (profile) {
        const cartItems = profile.cart || [];
        const index = cartItems.findIndex(item => item.product._id.toString() === _id.toString());

        if (index > -1) {
          if (isRemove) {
            cartItems.splice(index, 1);
          } else {
            cartItems[index].unit = qty;
          }
        } else if (!isRemove) {
          cartItems.push({ product, unit: qty });
        }

        profile.cart = cartItems;

        const result = await profile.save();
        return result.cart;
      }

      throw new Error("Customer not found");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Modify Cart"
      );
    }
  }

  async AddOrderToProfile(customerId, order) {
    try {
      const profile = await CustomerModel.findById(customerId);

      if (profile) {
        profile.orders = profile.orders || [];
        profile.orders.push(order);
        profile.cart = [];

        return await profile.save();
      }

      throw new Error("Customer not found");
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Add Order"
      );
    }
  }
}

module.exports = CustomerRepository;
