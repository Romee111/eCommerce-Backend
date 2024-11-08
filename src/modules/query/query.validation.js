// validations/query.validation.js
import Joi from "joi";

// Validation for submitting a new query
export const submitQueryValidation = Joi.object({
  userId: Joi.string().required(), // Assuming this is an ObjectId, so string format is used
  subject: Joi.string().min(3).max(100).required(),
  message: Joi.string().min(5).required(),
});

// Validation for adding a response to a query
export const addResponseValidation = Joi.object({
  message: Joi.string().min(1).required(),
  sender: Joi.string().valid("admin", "user").required(),
});

// Validation for updating the query status
export const updateQueryStatusValidation = Joi.object({
  status: Joi.string().valid("open", "resolved").required(),
});
