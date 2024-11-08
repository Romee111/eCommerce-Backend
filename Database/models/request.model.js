// models/request.model.js
import mongoose from 'mongoose';

// Define the schema for the Request model
const requestSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Assuming 'User' is the name of the Seller model
      required: true
    },
    requestType: {
      type: String,
      required: true,
      enum: ['update', 'delete', 'other'], // Types of requests
    },
    requestDetails: {
      type: String,
      required: true, // The details the seller wants to update or delete
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'unapproved', 'deleted', 'updated'], // Status options
      default: 'pending', // Default status when the request is created
    },
    response: {
      type: String, // Admin's response to the request
      default: '', // Initially empty, to be filled by the admin
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

// Create the model for the request
const Request = mongoose.model('Request', requestSchema);

export default Request;
