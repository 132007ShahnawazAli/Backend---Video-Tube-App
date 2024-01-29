import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";
import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
})

const app = express();
connectDB();


