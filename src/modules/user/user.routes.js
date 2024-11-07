import express from "express";
import * as User from "./user.controller.js";
import { protectedRoutes, allowedTo } from "../auth/auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateUserValidation,
} from "./user.validation.js";

const userRouter = express.Router();

userRouter
  .route("/addUser")
  .post(
    protectedRoutes,
    allowedTo("admin"),
    validate(addUserValidation), User.addUser)

  userRouter
  .route("/getAllUsers")
  .get(User.getAllUsers);
 userRouter
 .route("/deleteUser/:id")
 .delete(
  protectedRoutes,
  allowedTo("admin"),
  validate(deleteUserValidation),User.deleteUser);

userRouter
  .route("/updateUser/:id")
  .put(
    protectedRoutes,
    allowedTo("admin"),
    validate(updateUserValidation), User.updateUser)
 userRouter
  .route("/changeUserPassword/:id")
  .patch(validate(changeUserPasswordValidation), User.changeUserPassword);

export default userRouter;
