// routes/query.routes.js
import express from "express";
import * as queryController from "./query.controller.js";
import { protectedRoutes,allowedTo } from "../auth/auth.controller.js";
import { validate } from "../../middlewares/validate.js"; // Custom validation middleware
import {
  submitQueryValidation,
  addResponseValidation,
  updateQueryStatusValidation,

} from "../../modules/query/query.validation.js";

const queryRouter = express.Router();

// Route to submit a new query
queryRouter

  .route("/submitQuery")
  .post(
    protectedRoutes ,
    allowedTo("user","seller"),
    validate(submitQueryValidation), queryController.submitQuery);

// Route for admin to add a response to a query
queryRouter
  .route("/addResponseToQuery/:id")
  .post(
    protectedRoutes,
    allowedTo("admin","seller","user"),
    validate(addResponseValidation), queryController.addResponseToQuery);

// Route for either admin or user to add a message to the query conversation
queryRouter

  .route("/:id/addMessageToQuery")
  .post(
    protectedRoutes,
    allowedTo("admin","seller","user"),
    validate(addResponseValidation), queryController.addMessageToQuery);

// Route to update the query status
queryRouter
  .route("/updateQueryStatus /:id/status")
  .patch(
    protectedRoutes,
    allowedTo("admin"),
    validate(updateQueryStatusValidation), queryController.updateQueryStatus);

// Route to get all queries (for admin)
queryRouter
  .route("/getallQueries")
  .get(
    protectedRoutes,
    allowedTo("admin"),
    queryController.getAllQueries);

export default queryRouter;
