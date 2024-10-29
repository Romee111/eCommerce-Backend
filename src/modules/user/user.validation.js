import Joi from "joi";

const addUserValidation = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().required().trim(),
  password: Joi.string().required(),
  role: Joi.string().valid("admin", "user", "seller").optional(), // Allow role field
  addresses: Joi.array().items(
    Joi.object({
      city: Joi.string().required(),
      street: Joi.string().required(),
      phone: Joi.string().required(),
    })
  ).optional(), // Allow addresses field
  sellerInfo: Joi.object({
    businessName: Joi.string().required(),
    businessAddress: Joi.string().required(),
    businessType: Joi.string().required(),
    taxIdNumber: Joi.string().optional(),
    bankAccountNumber: Joi.string().optional(),
    bankName: Joi.string().optional(),
    accountHolderName: Joi.string().optional(),
    branchCode: Joi.string().optional(),
    documents: Joi.object({
      idCardNumber: Joi.string().optional(),
      idImage1: Joi.string().optional(),
      idImage2: Joi.string().optional(),
    }).optional(),
  }).optional(), // Allow sellerInfo if role is seller
});


const updateUserValidation = Joi.object({
  name: Joi.string().trim(),
  password: Joi.string(),
  id: Joi.string().hex().length(24).required(),
  role: Joi.string().valid("admin", "user", "seller").optional(),
  addresses: Joi.array().items(
    Joi.object({
      city: Joi.string(),
      street: Joi.string(),
      phone: Joi.string(),
    })
  ).optional(),
  sellerInfo: Joi.object({
    businessName: Joi.string(),
    businessAddress: Joi.string(),
    businessType: Joi.string(),
    taxIdNumber: Joi.string().optional(),
    bankAccountNumber: Joi.string().optional(),
 }) 
    .or("taxIdNumber", "bankAccountNumber")
    .optional(),

  documents: Joi.object({
    idCardNumber: Joi.string().optional(),
    idImage1: Joi.string().optional(),
    idImage2: Joi.string().optional(),
  }).optional(),

  
});

const changeUserPasswordValidation = Joi.object({
  password: Joi.string().required(),
  id: Joi.string().hex().length(24).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addUserValidation,
  updateUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
};
