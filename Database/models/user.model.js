import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import e from "express";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["admin", "user", "seller"], // Add "seller" as a role
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    wishlist: [{ type: Schema.ObjectId, ref: "product" }],
    addresses: [
      {
        city: String,
        street: String,
        phone: String,
      },
    ],
    // Seller-specific fields
    sellerInfo: {
      businessName: { type: String, trim: true },
      businessAddress: { type: String, trim: true },
      businessType: { type: String },
      taxIdNumber: { type: String, unique: true, sparse: true },
      bankAccountNumber: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
      branchCode: { type: String },
      documents: {
        idCardNumber: { type: String, unique: true, sparse: true },
        idImage1: { type: String }, // path or URL to the image
        idImage2: { type: String }, // path or URL to the image
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(this.password, 8);
});

// Hash password if updated during "findOneAndUpdate"
userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(this._update.password, 8);
  }
});

const userModel = model("user", userSchema);
export default userModel;

