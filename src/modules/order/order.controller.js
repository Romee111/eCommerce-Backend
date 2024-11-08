import axios from "axios";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import  userModel  from "../../../Database/models/user.model.js";

const KLARNA_API_URL = "https://api.playground.klarna.com/checkout/v3/orders";
const KLARNA_API_KEY = "sk_test_26PHem9AhJZvU623DfE1x4sd";

// Helper function to create a Klarna order
const createKlarnaOrder = async (cart, user, shippingAddress) => {
  const orderPayload = {
    purchase_country: "US",
    purchase_currency: "USD",
    locale: "en-US",
    order_amount: cart.totalPrice * 100, // Amount in cents
    order_tax_amount: 0, // Adjust based on your tax settings if needed
    order_lines: cart.cartItem.map((item) => ({
      name: item.productId.title,
      quantity: item.quantity,
      unit_price: item.productId.price * 100,
      total_amount: item.quantity * item.productId.price * 100,
      total_tax_amount: 0, // Set if applicable
    })),
    merchant_urls: {
      confirmation: "https://yourwebsite.com/confirmation",
      notification: "https://yourwebsite.com/api/v1/orders/klarna/webhook", // Webhook URL for Klarna notifications
    },
  };

  const response = await axios.post(KLARNA_API_URL, orderPayload, {
    auth: {
      username: KLARNA_API_KEY,
      password: "", // Password left empty for API key authentication
    },
  });

  return response.data;
};

// Create Checkout Session for Klarna
const createCheckOutSession = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const user = req.user;

  // Initiate Klarna order and get checkout session URL
  const klarnaOrder = await createKlarnaOrder(cart, user, req.body.shippingAddress);

  res.status(200).json({
    message: "Checkout session created",
    klarnaCheckoutUrl: klarnaOrder.redirect_url, // Redirect user to this URL to complete payment
  });
});

// Webhook to handle Klarna Order Completion (used in createOnlineOrder)
const createOnlineOrder = catchAsyncError(async (req, res, next) => {
  const klarnaOrderId = req.body.order_id;

  // Find the corresponding order in your database
  const order = await orderModel.findOne({ klarnaOrderId });
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Update the order as paid if Klarna confirms payment completion
  if (req.body.event_type === "checkout_order_completion") {
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();

    // Update product quantities or perform additional actions as needed
    const updateOptions = order.cartItem.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));
    await productModel.bulkWrite(updateOptions);

    // Delete cart after successful order
    await cartModel.findOneAndDelete({ userId: order.userId });

    res.status(200).json({ message: "Order confirmed and updated as paid" });
  } else {
    res.status(400).json({ message: `Unhandled event type ${req.body.event_type}` });
  }
});

// Other functions (unchanged)
const createCashOrder = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const user = req.user;
  const totalOrderPrice = cart.totalPriceAfterDiscount || cart.totalPrice;

  // Create Klarna order
  const klarnaOrder = await createKlarnaOrder(cart, user, req.body.shippingAddress);

  // Save the order in database
  const order = new orderModel({
    userId: user._id,
    cartItem: cart.cartItem,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "Klarna",
    klarnaOrderId: klarnaOrder.order_id,
  });
  await order.save();

  // Update product quantities
  const updateOptions = cart.cartItem.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));
  await productModel.bulkWrite(updateOptions);

  // Delete cart after order creation
  await cartModel.findByIdAndDelete(req.params.id);

  res.status(201).json({
    message: "Order created successfully with Klarna",
    order,
    klarnaOrder,
  });
});

const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel
    .findOne({ userId: req.user._id })
    .populate("cartItems.productId");

  if (!order) return next(new AppError("Order not found", 404));

  res.status(200).json({ message: "success", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await orderModel.find({}).populate("cartItems.productId");
  res.status(200).json({ message: "success", orders });
});

// Export functions
export {
  createKlarnaOrder,
  getSpecificOrder,
  getAllOrders,
  createCheckOutSession,
  createOnlineOrder,
};

// import { catchAsyncError } from "../../utils/catchAsyncError.js";
// import { AppError } from "../../utils/AppError.js";
// import { cartModel } from "../../../Database/models/cart.model.js";
// import { productModel } from "../../../Database/models/product.model.js";
// import { orderModel } from "../../../Database/models/order.model.js";

// import Stripe from "stripe";
// import { userModel } from "../../../Database/models/user.model.js";
// const stripe = new Stripe(
//   "sk_test_51NV8e0HVbfRYk4SfG3Ul84cabreiXkPbW1xMugwqvU9is2Z2ICEafTtG6NHLIUdFVIjkiRHYmAPKxCLsCpoU2NnN00LVpHcixz"
// );

// const createCashOrder = catchAsyncError(async (req, res, next) => {
//   let cart = await cartModel.findById(req.params.id);

//   // console.log(cart);
//   let totalOrderPrice = cart.totalPriceAfterDiscount
//     ? cart.totalPriceAfterDiscount
//     : cart.totalPrice;

//   console.log(cart.cartItem);
//   const order = new orderModel({
//     userId: req.user._id,
//     cartItem: cart.cartItem,
//     totalOrderPrice,
//     shippingAddress: req.body.shippingAddress,
//   });

//   await order.save();

//   // console.log(order);
//   if (order) {
//     let options = cart.cartItem.map((item) => ({
//       updateOne: {
//         filter: { _id: item.productId },
//         update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
//       },
//     }));

//     await productModel.bulkWrite(options);

//     await cartModel.findByIdAndDelete(req.params.id);

//     return res.status(201).json({ message: "success", order });
//   } else {
//     next(new AppError("Error in cart ID", 404));
//   }
// });

// const getSpecificOrder = catchAsyncError(async (req, res, next) => {
//   console.log(req.user._id);

//   let order = await orderModel
//     .findOne({ userId: req.user._id })
//     .populate("cartItems.productId");

//   res.status(200).json({ message: "success", order });
// });

// const getAllOrders = catchAsyncError(async (req, res, next) => {
//   let orders = await orderModel.findOne({}).populate("cartItems.productId");

//   res.status(200).json({ message: "success", orders });
// });

// const createCheckOutSession = catchAsyncError(async (req, res, next) => {
//   let cart = await cartModel.findById(req.params.id);
//   if(!cart) return next(new AppError("Cart was not found",404))

//   console.log(cart);

//   // console.log(cart);
//   let totalOrderPrice = cart.totalPriceAfterDiscount
//     ? cart.totalPriceAfterDiscount
//     : cart.totalPrice;

//   let sessions = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           currency: "egp",
//           unit_amount: totalOrderPrice * 100,
//           product_data: {
//             name: req.user.name,
//           },
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: "https://github.com/AbdeIkader",
//     cancel_url: "https://www.linkedin.com/in/abdelrahman-abdelkader-259781215/",
//     customer_email: req.user.email,
//     client_reference_id: req.params.id,
//     metadata: req.body.shippingAddress,
//   });

//   res.json({ message: "success", sessions });
// });

// const createOnlineOrder = catchAsyncError(async (request, response) => {
//   const sig = request.headers["stripe-signature"].toString();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       request.body,
//       sig,
//       "whsec_fcatGuOKvXYUQoz5NWSwH9vaqdWXIWsI"
//     );
//   } catch (err) {
//     return response.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   if (event.type == "checkout.session.completed") {
//     // const checkoutSessionCompleted = event.data.object;
//     card(event.data.object,response)


//   } else {
//     console.log(`Unhandled event type ${event.type}`);
//   }
// });

// //https://ecommerce-backend-codv.onrender.com/api/v1/orders/checkOut/6536c48750fab46f309bb950


// async function card (e,res){
//   let cart = await cartModel.findById(e.client_reference_id);

//   if(!cart) return next(new AppError("Cart was not found",404))

//   let user = await userModel.findOne({email:e.customer_email})
//   const order = new orderModel({
//     userId: user._id,
//     cartItem: cart.cartItem,
//     totalOrderPrice : e.amount_total/100,
//     shippingAddress: e.metadata.shippingAddress,
//     paymentMethod:"card",
//     isPaid:true,
//     paidAt:Date.now()
//   });

//   await order.save();

//   // console.log(order);
//   if (order) {
//     let options = cart.cartItem.map((item) => ({
//       updateOne: {
//         filter: { _id: item.productId },
//         update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
//       },
//     }));

//     await productModel.bulkWrite(options);

//     await cartModel.findOneAndDelete({userId: user._id});

//     return res.status(201).json({ message: "success", order });
//   } else {
//     next(new AppError("Error in cart ID", 404));
//   }
// }

// export {
//   createCashOrder,
//   getSpecificOrder,
//   getAllOrders,
//   createCheckOutSession,
//   createOnlineOrder,
// };
