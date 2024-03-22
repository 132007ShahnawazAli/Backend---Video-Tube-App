import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const alreadySubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (alreadySubscribed) {
    await Subscription.findOneAndDelete(alreadySubscribed._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Already Subscribed, Unsubscribed from channel")
      );
  }

  const newSubscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!newSubscription) {
    throw new ApiError(404, "Failed to create subscription");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Successfully Subscribed", newSubscription));
});

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: return subscriber list of a channel
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscribers = await Subscription.find({
    channel: channelId,
  }).populate("subscriber");

  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(
      404,
      "Failed to get subscribers or no subscribers found"
    );
  }

  res.status(200).json(new ApiResponse(200, "Successfully retrieved subscribers", subscribers));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscribedChannels = await Subscription.find({
    subscriber: req.user._id,
  }).populate("channel");

  if (!subscribedChannels || subscribedChannels.length === 0) {
    throw new ApiError(
      404,
      "Failed to get subscribers or no channel Subscribed"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Successfully retrieved Subscribed Channels",
        subscribedChannels
      )
    );
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
