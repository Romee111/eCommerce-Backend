import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../Database/models/user.model.js";
import bcrypt from "bcrypt";

// const addUser = catchAsyncError(async (req, res, next) => {
//   const addUser = new userModel(req.body);
//   await addUser.save();

//   res.status(201).json({ message: "success", addUser });
// });
const addUser = catchAsyncError(async (req, res, next) => {
  // Check if role is "seller" and validate seller-specific fields
  if (req.body.role === "seller") {
    const requiredSellerFields = [
      "businessName",
      "businessAddress",
      "businessType",
      "taxIdNumber",
      "bankAccountNumber",
      "bankName",
      "accountHolderName",
      "branchCode",
    ];
    // Verify that all required fields for a seller are present
    for (const field of requiredSellerFields) {
      if (!req.body.sellerInfo || !req.body.sellerInfo[field]) {
        return res
          .status(400)
          .json({ message: `Missing required seller field: ${field}` });
      }
    }
  }

  // Create a new user (either "user" or "seller") with the provided data
  const newUser = new userModel(req.body);
  await newUser.save();

  res.status(201).json({ message: "success", user: newUser });
});


const getAllUsers = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(userModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllUsers = await apiFeature.mongooseQuery;

  res.status(201).json({ page: PAGE_NUMBER, message: "success", getAllUsers });
});

const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updateUser = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateUser && res.status(201).json({ message: "success", updateUser });

  !updateUser && next(new AppError("User was not found", 404));
});

const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.passwordChangedAt = Date.now();
  console.log(req.body.passwordChangedAt);
  const changeUserPassword = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  changeUserPassword &&
    res.status(201).json({ message: "success", changeUserPassword });

  !changeUserPassword && next(new AppError("User was not found", 404));
});
const deleteUser = deleteOne(userModel, "user");

export { addUser, getAllUsers, updateUser, deleteUser, changeUserPassword };
