import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!(name && description)) {
    throw new ApiError(404, "Name and description is required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Failed to create playlist");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const playlists = await Playlist.find({ owner: userId });

  if (!playlists.length) {
    throw new ApiError(404, "User does not have any playlists");
  }

  if (!playlists) {
    throw new ApiError(404, "Failed to get user playlists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Playlists retrieved successfully", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Failed to get playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Playlist retrieved successfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid Video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to add this video to this playlist"
    );
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Failed to add video to playlist");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Video added to playlist successfully",
        updatedPlaylist
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid Video id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video not in playlist");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to remove this video from this playlist"
    );
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(404, "Failed to Remove video from playlist");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Video removed from playlist successfully",
        updatePlaylist
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this playlist");
  }

  const DeletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!DeletedPlaylist) {
    throw new ApiError(404, "Failed to delete playlist");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, "Playlist deleted successfully", DeletedPlaylist)
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist id");
  }

  if (!(name || description)) {
    throw new ApiError(404, "Name or description is required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Failed to update playlist");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Playlist updated successfully", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
