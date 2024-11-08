import express from "express";
import * as category from "./category.controller.js";
import subCategoryRouter from "../subcategory/subcategory.routes.js";
import {
  addCategoryValidation,
  deleteCategoryValidation,
  updateCategoryValidation,
} from "./category.validation.js";
import { validate } from "../../middlewares/validate.js";
import { uploadSingleFile } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const categoryRouter = express.Router();

categoryRouter.use("/:categoryId/subcategories", subCategoryRouter);

categoryRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("admin","seller"),
    uploadSingleFile("Image", "category"),
    validate(addCategoryValidation),
    category.addCategory
  )
  categoryRouter
  .route("/getAllCategories")
  .get(category.getAllCategories);

categoryRouter
  .route("/:id")
  .put(
    protectedRoutes,
    allowedTo("admin","seller"),
    validate(updateCategoryValidation),
    category.updateCategory
  )
  .delete(
    protectedRoutes,
    allowedTo("admin","seller"),
    validate(deleteCategoryValidation),
    category.deleteCategory
  );

export default categoryRouter;
