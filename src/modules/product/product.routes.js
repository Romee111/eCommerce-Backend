import express from "express";
import * as product from "./product.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addProductValidation,
  deleteProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
} from "./product.validation.js";
import { uploadMultipleFiles } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const productRouter = express.Router();

let arrFields = [
  { name: "imgCover", maxCount: 1 },
  { name: "images", maxCount: 20 },
];

productRouter
  .route("/addProduct")
  .post(
    protectedRoutes,
    allowedTo( "seller","admin"),
    uploadMultipleFiles(arrFields, "products"),
    validate(addProductValidation),
    product.
    addProduct
  )
  productRouter
  .route("/getAllProducts")
  .get(product.getAllProducts);

productRouter
  .route("/getProducts")
  .get(product.getProducts);

productRouter
  .route("/updateProduct/:id")
  .put(
    protectedRoutes,
    allowedTo("admin", "seller"),
    validate(updateProductValidation),
    product.updateProduct
  )
  productRouter
  .route("/deleteProduct/:id")
  .delete(
    protectedRoutes,
    allowedTo("admin", "seller"),
    validate(deleteProductValidation),
    product.deleteProduct
  )
  .get(validate(getSpecificProductValidation), product.getSpecificProduct);

export default productRouter;
