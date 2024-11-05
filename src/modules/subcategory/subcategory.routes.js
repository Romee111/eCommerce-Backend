import express from "express";
import * as subCategory from "./subcategory.controller.js";
import { validate } from "./../../middlewares/validate.js";
import {
  addSubCategoryValidation,
  deleteSubCategoryValidation,
  updateSubCategoryValidation,
} from "./subcategory.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const subCategoryRouter = express.Router({ mergeParams: true });

subCategoryRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("admin","seller"),
    validate(addSubCategoryValidation),
    subCategory.addSubCategory
  )
  subCategoryRouter
  .route("/getAllSubCategories")
  .get(subCategory.getAllSubCategories);

subCategoryRouter
  .route("/:id")
  .put(
    protectedRoutes,
    allowedTo("admin","seller"),
    validate(updateSubCategoryValidation),
    subCategory.updateSubCategory
  )
  .delete(
    protectedRoutes,
    allowedTo("admin","seller"),
    validate(deleteSubCategoryValidation),
    subCategory.deleteSubCategory
  );

export default subCategoryRouter;
