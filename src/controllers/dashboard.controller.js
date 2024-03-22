import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const stats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $project: {
        totalSubscriber: { $size: "$subscribers" },
        username: 1,
        email: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        createdAt: 1,
        subscribers: 1,
      },
    },
  ]);

  if (!stats) {
    throw new ApiError(404, "Unable to get stats for Your channel");
  }
  res.status(200).json(new ApiResponse(stats));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        likes: {
          $cond: {
            if: { $isArray: "$likes" },
            then: { $size: "$likes" },
            else: 0,
          },
        },
        commentCount: {
          $size: "$comments",
        },
      },
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
        comments: 1,
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(404, "No videos found for this channel");
  }

  res.status(200).json(new ApiResponse(videos));
});

export { getChannelStats, getChannelVideos };
