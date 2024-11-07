import slugify from "slugify";

import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { productModel } from "./../../../Database/models/product.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// const addProduct = catchAsyncError(async (req, res, next) => {
//   try {
//     // If you're using file uploads (like with multer)
//     // req.body.imgCover = req.files.imgCover[0].filename;
//     // req.body.images = req.files.images.map((ele) => ele.filename);
    
//     req.body.slug = slugify(req.body.title);  // Create slug from title
//     const addProduct = new productModel(req.body);
    
//     // Save the new product
//     await addProduct.save();
    
//     // Send response
//     res.status(201).json({ message: "Product added successfully", addProduct });
//   } catch (error) {
//     next(error);  // Pass the error to the global error handler
//   }
// });
const addProduct = catchAsyncError(async (req, res, next) => {
  req.body.slug = slugify(req.body.title);
  const addProduct = new productModel(req.body);

  // Add this check to prevent errors
  await addProduct.save();

  // Send response
  res.status(201).json({ message: "success", addProduct });
});


const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .limit()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});
const getProducts=catchAsyncError(async(req,res,next)=>{
  const getProducts=await productModel.find();
  res.status(201).json({message:"success",getProducts})  
} 
    
)

const getSpecificProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const getSpecificProduct = await productModel.findByIdAndUpdate(id);
  res.status(201).json({ message: "success", getSpecificProduct });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  const updateProduct = await productModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateProduct && res.status(201).json({ message: "success", updateProduct });

  !updateProduct && next(new AppError("Product was not found", 404));
});

const deleteProduct = deleteOne(productModel, "Product");
export {
  addProduct,
  getAllProducts,
  getProducts,
  getSpecificProduct,
  updateProduct,
  deleteProduct,
};
