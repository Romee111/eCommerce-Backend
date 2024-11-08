// controllers/queryController.js
 import Query from '../../../Database/models/query.model.js';
import catchAsyncError from "../utils/catchAsyncError.js";
import AppError from "../utils/AppError.js";

// Submit a new query
exports.submitQuery = catchAsyncError(async (req, res, next) => {
  const { subject, message } = req.body;
  const userId = req.user._id; // Assuming req.user contains authenticated user data

  const newQuery = await Query.create({
    userId,
    subject,
    message,
  });

  res.status(201).json({ message: "Query submitted successfully", query: newQuery });
});

// Get all queries for admin
exports.getAllQueries = catchAsyncError(async (req, res, next) => {
  const queries = await Query.find().populate("userId", "name email"); // Optionally populate user info

  res.status(200).json({ message: "Success", queries });
});

// Update query status
exports.updateQueryStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedQuery = await Query.findByIdAndUpdate(id, { status }, { new: true });

  if (!updatedQuery) {
    return next(new AppError("Query not found", 404));
  }

  res.status(200).json({ message: "Query status updated", query: updatedQuery });
});

exports.addResponseToQuery = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { message } = req.body;
  
    const query = await Query.findById(id);
  
    if (!query) {
      return next(new AppError("Query not found", 404));
    }
  
    query.responses.push({
      message,
      sender: "admin",
    });
    await query.save();
  
    res.status(200).json({ message: "Response added successfully", query });
  });


  exports.addMessageToQuery = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { message } = req.body;
    const sender = req.user.role === "admin" ? "admin" : "user";
  
    const query = await Query.findById(id);
  
    if (!query) {
      return next(new AppError("Query not found", 404));
    }
  
    query.responses.push({ message, sender });
    await query.save();
  
    res.status(200).json({ message: "Message added successfully", query });
  });



  export {
    submitQuery,
    getAllQueries,
    updateQueryStatus,
    addResponseToQuery,
    addMessageToQuery
}