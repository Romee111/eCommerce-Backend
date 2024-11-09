import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { couponModel } from "../../../Database/models/coupon.model.js";
import mongoose from 'mongoose';

// Function to calculate total price of the cart
function calcTotalPrice(cart) {
  let totalPrice = 0;
  cart.cartItem.forEach((element) => {
    totalPrice += element.quantity * element.price;
  });
  cart.totalPrice = totalPrice;
}

// Add product to cart
// const addProductToCart = catchAsyncError(async (req, res, next) => {
//   // Ensure the productId is a valid ObjectId
//   let product_id = req.body.productId;
  
//   try {
//     productId = mongoose.Types.ObjectId(req.body.productId); // Convert to ObjectId
//   } catch (err) {
//     return next(new AppError("Invalid Product ID format", 400));
//   }

//   // Search for the product by ID
//   let product = await productModel
//     .findById(productId)
//     .select("price");

//   // If the product is not found, return an error
//   if (!product) {
//     return next(new AppError("Product was not found", 404));
//   }

//   // Set the price from the product found
//   req.body.price = product.price;

//   // Check if the cart exists for the user
//   let isCartExist = await cartModel.findOne({
//     userId: req.user._id,
//   });

//   // If cart doesn't exist, create a new cart with the product
//   if (!isCartExist) {
//     let result = new cartModel({
//       userId: req.user._id,
//       cartItem: [req.body],
//     });
//     calcTotalPrice(result);
//     await result.save();
//     return res.status(201).json({ message: "success", result });
//   }

//   // If the cart exists, check if the product already exists in the cart
//   let item = isCartExist.cartItem.find((element) => {
//     return element.productId.toString() === req.body.productId;
//   });

//   if (item) {
//     // If the item exists, update the quantity
//     item.quantity += req.body.quantity || 1;
//   } else {
//     // If the item doesn't exist, add it to the cart
//     isCartExist.cartItem.push(req.body);
//   }

//   // Recalculate the total price
//   calcTotalPrice(isCartExist);

//   // Apply discount if exists
//   if (isCartExist.discount) {
//     isCartExist.totalPriceAfterDiscount =
//       isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100;
//   }

//   // Save the updated cart
//   await isCartExist.save();

//   // Return the updated cart
//   res.status(201).json({ message: "success", result: isCartExist });
// });
const addProductToCart = catchAsyncError(async (req, res, next) => {
  let productId = req.body.cartItem[0].productId;

  // Convert productId to ObjectId
  try {
    productId = new mongoose.Types.ObjectId(productId); // Convert to ObjectId
  } catch (err) {
    return next(new AppError("Invalid Product ID format", 400));
  }

  // Fetch product price
  let product = await productModel.findById(productId).select("price");
  if (!product) {
    return next(new AppError("Product was not found", 404));
  }

  req.body.cartItem[0].price = product.price; // Set price directly in cartItem array

  // Check if cart exists for the user
  let isCartExist = await cartModel.findOne({ userId: req.user._id });
  if (!isCartExist) {
    let result = new cartModel({
      userId: req.user._id,
      cartItem: [{
        productId: productId,
        quantity: req.body.cartItem[0].quantity,
        price: req.body.cartItem[0].price,
        totalProductDiscount: req.body.cartItem[0].totalProductDiscount
      }]
    });
    calcTotalPrice(result);
    await result.save();
    return res.status(201).json({ message: "success", result });
  }

  // Check if product is already in cart
  let item = isCartExist.cartItem.find(
    (element) => element.productId === productId.toString()
  );

  if (item) {
    item.quantity += req.body.cartItem[0].quantity || 1;
  } else {
    isCartExist.cartItem.push({
      productId: productId,
      quantity: req.body.cartItem[0].quantity,
      price: req.body.cartItem[0].price,
      totalProductDiscount: req.body.cartItem[0].totalProductDiscount
    });
  }

  calcTotalPrice(isCartExist);

  if (isCartExist.discount) {
    isCartExist.totalPriceAfterDiscount =
      isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100;
  }

  await isCartExist.save();
  res.status(201).json({ message: "success", result: isCartExist });
});


// Remove product from cart
const removeProductFromCart = catchAsyncError(async (req, res, next) => {
  let result = await cartModel.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { cartItem: { _id: req.params.id } } },
    { new: true }
  );
  if (!result) return next(new AppError("Item was not found", 404));
  calcTotalPrice(result);
  if (result.discount) {
    result.totalPriceAfterDiscount =
      result.totalPrice - (result.totalPrice * result.discount) / 100;
  }
  res.status(200).json({ message: "success", cart: result });
});

// Update product quantity in the cart
const updateProductQuantity = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.params.id);
  if (!product) return next(new AppError("Product was not found", 404));

  let isCartExist = await cartModel.findOne({ userId: req.user._id });

  let item = isCartExist.cartItem.find((elm) => elm.productId == req.params.id);
  if (item) {
    item.quantity = req.body.quantity;
  }
  calcTotalPrice(isCartExist);

  if (isCartExist.discount) {
    isCartExist.totalPriceAfterDiscount =
      isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100;
  }
  await isCartExist.save();

  res.status(201).json({ message: "success", cart: isCartExist });
});

// Apply coupon to cart
const applyCoupon = catchAsyncError(async (req, res, next) => {
  let coupon = await couponModel.findOne({
    code: req.body.code,
    expires: { $gt: Date.now() },
  });

  let cart = await cartModel.findOne({ userId: req.user._id });

  cart.totalPriceAfterDiscount =
    cart.totalPrice - (cart.totalPrice * coupon.discount) / 100;

  cart.discount = coupon.discount;

  await cart.save();

  res.status(201).json({ message: "success", cart });
});

// Get logged user's cart
const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
  let cartItems = await cartModel.findOne({ userId: req.user._id }).populate('cartItem.productId');
  res.status(200).json({ message: "success", cart: cartItems });
});

export {
  addProductToCart,
  removeProductFromCart,
  updateProductQuantity,
  applyCoupon,
  getLoggedUserCart
};
