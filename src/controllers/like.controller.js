import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!(video.isPublished && video)) {
    throw new ApiError(400, "Video not found");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully"));
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!newLike) {
    throw new ApiError(500, "Failed to like video");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Video liked successfully", newLike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully"));
  }

  const newLike = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!newLike) {
    throw new ApiError(500, "Failed to like comment");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Comment liked successfully", newLike));
});

// const toggleTweetLike = asyncHandler(async (req, res) => {
//   const { tweetId } = req.params;
//   //TODO: toggle like on tweet

//   if (!isValidObjectId(tweetId)) {
//     throw new ApiError(400, "Invalid tweet id");
//   }

//   const tweet = await Tweet.findById(tweetId);

//   if (!tweet) {
//     throw new ApiError(400, "Tweet not found");
//   }

//   const alreadyLiked = await Like.findOne({
//     tweet: tweetId,
//     likedBy: req.user._id,
//   });

//   if (alreadyLiked) {
//     await Like.findByIdAndDelete(alreadyLiked._id);
//     return res
//     .status(200)
//     .json(new ApiResponse(200, "Tweet unliked successfully"));
//   }

//   const newLike = await Like.create({
//     tweet: tweetId,
//     likedBy: req.user._id,
//   });

//   if (!newLike) {
//     throw new ApiError(500, "Failed to like tweet");
//   }

//   res
//    .status(201)
//    .json(new ApiResponse(201, "Tweet liked successfully", newLike));
// });

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        //gives the videos liked by the user
        likedBy: req.user._id,
        video: { $exists: true },
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
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$likedBy",
      },
    },
    {
      $unwind: {
        path: "$video",
      },
    },
    {
      $unwind: {
        path: "$owner",
      },
    },
    {
      $project: {
        likedBy: {
          _id: "$likedBy._id",
          username: "$likedBy.username",
          email: "$likedBy.email",
          fullname: "$likedBy.fullname",
        },
        video: {
          title: "$video.title",
          description: "$video.description",
          duration: "$video.duration",
          views: "$video.views",
          owner: {
            _id: "$owner._id",
            username: "$owner.username",
            email: "$owner.email",
            fullname: "$owner.fullname",
          },
          createdAt: "$video.createdAt",
          updatedAt: "$video.updatedAt",
          videoFile: "$video.videoFile",
          thumbnail: "$video.thumbnail",
          isPublished: "$video.isPublished",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(404, "No liked videos found");
  }

  res.status(200).json(new ApiResponse(200, "Liked videos", likedVideos));
});

export {
  toggleCommentLike,
  //  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};
