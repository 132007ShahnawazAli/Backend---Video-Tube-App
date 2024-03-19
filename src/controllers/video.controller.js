import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteAssetFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail files are required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(400, "Video upload failed");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
    views: 0,
    isPublished: false,
  });

  if (!newVideo) {
    throw new ApiError(500, "Video upload failed");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Video uploaded successfully", newVideo));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  const video = await Video.findById(videoId);

  if (
    !video.isPublished &&
    video.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not allowed to view this video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Video retrieved successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file.path;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  let detailsToUpdate = {};

  if (title) detailsToUpdate.title = title;
  if (description) detailsToUpdate.description = description;

  let oldThumbnailLink;
  if (thumbnailLocalPath) {
    oldThumbnailLink = (await Video.findById(videoId)).thumbnail;
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      throw new ApiError(500, "Thumbnail upload failed");
    }
    detailsToUpdate.thumbnail = thumbnail.url;
  }

  const video = await Video.findById(videoId);
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  const newVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: detailsToUpdate,
    },
    { new: true }
  );

  if (!newVideo) {
    throw new ApiError(404, "Video not found");
  }

  if (thumbnailLocalPath) {
    const deleteThumbnail = await deleteAssetFromCloudinary(oldThumbnailLink);
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", newVideo));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (
    (await Video.findById(videoId)).owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }
  const thumbnailLink = (await Video.findById(videoId).select("thumbnail -_id"))
    .thumbnail;

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await deleteAssetFromCloudinary(thumbnailLink);

  res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", video));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  video.isPublished = !video.isPublished;

  const updatedVideo = await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video publish status updated successfully",
        updatedVideo
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
