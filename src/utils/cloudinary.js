import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteAssetFromCloudinary = async (assetLink) => {
  try {
    const publicId = assetLink.split('/').pop().split('.')[0];
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new ApiError(500, "Error deleting file from Cloudinary", [error]);
  }
};

export { uploadOnCloudinary, deleteAssetFromCloudinary};
