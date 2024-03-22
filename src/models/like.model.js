import mongoose from "mongoose";

const likesSchema = new mongoose.Schema(
  {
    // if video is liked
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // if tweet is liked
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    // if comment is liked
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likesSchema);
