import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(404, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Failed to create tweet");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  if (!tweets || tweets.length === 0) {
    throw new ApiError(
      400,
      "Failed to retrieve tweets or no tweets were found"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Tweets retrieved successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { content } = req.body;
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (!content) {
    throw new ApiError(404, "Content is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "You are not allowed to update this tweet");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    req.params.tweetId,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(400, "Failed to update tweet");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "You are not allowed to delete this tweet");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(400, "Failed to delete tweet");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", deletedTweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
