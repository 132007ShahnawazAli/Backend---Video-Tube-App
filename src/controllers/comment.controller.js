import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const videoComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
      },
    },
    {
      $unwind: {
        path: "$video",
      },
    },
    {
      $unwind: {
        path: "$likedBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$owner",
      },
    },
    {
      $project: {
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        videoDetails: {
          title: "$video.title",
          description: "$video.description",
          video: "$video.video",
          thumbnail: "$video.thumbnail",
          duration: "$video.duration",
          views: "$video.views",
          isPublished: "$video.isPublished",
        },
        ownerDetails: {
          username: "$owner.username",
          fullname: "$owner.fullname",
          email: "$owner.email",
        },
      },
    },
  ]);

  if (!(videoComments || videoComments.length > 0)) {
    throw new ApiError(404, "No comments found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Comments retrieved successfully", videoComments)
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { comment } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const newComment = await Comment.create({
    comment: comment,
    video: videoId,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", newComment));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { comment } = req.body;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }
  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { comment: comment },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", deletedComment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
