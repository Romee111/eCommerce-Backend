// controllers/request.controller.js
import Request  from '../../../Database/models/request.model.js';
import { notifySellerStatus } from '../../utils/emailsender.js';  // Import the notify function

export const createRequest = async (req, res, next) => {
    try {
      const { requestType, requestDetails } = req.body;
      const sellerId = req.user.id; // Assuming the seller is authenticated and their ID is stored in the session or JWT
  
      // Validate required fields
      if (!requestType || !requestDetails) {
        return res.status(400).json({
          status: 'fail',
          message: 'Request type and details are required.',
        });
      }
  
      // Create a new request document
      const newRequest = new Request({
        sellerId,
        requestType,
        requestDetails,
        status: 'pending', // Default status when the request is created
      });
  
      // Save the request to the database
      await newRequest.save();
  
      // Send success response
      res.status(201).json({
        status: 'success',
        message: 'Request submitted successfully.',
        request: newRequest,
      });
    } catch (error) {
      next(error);
    }
  };
export const respondToRequest = async (req, res, next) => {
  try {
    const { id } = req.params; // Request ID from the URL
    const { status, response } = req.body; // Status and response message from the admin

    // Update the request status and response message
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status, response },
      { new: true }
    ).populate('sellerId'); // Populate seller details to get their email

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Send email notification to the seller based on the status
    await notifySellerStatus(updatedRequest.sellerId.email, status);

    // Return success response
    res.status(200).json({
      message: "Request status updated and notification sent",
      request: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};
