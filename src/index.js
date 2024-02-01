import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app}  from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Server is not running due to : " + error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port https://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection Failed !!!  : " + err);
  });
