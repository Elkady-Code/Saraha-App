import mongoose from "mongoose";

const connectionDB = async () => {
  await mongoose
    .connect(process.env.URI_CONNECTION_ONLINE)
    .then(() => {
      console.log("Connected to Mongo DB!");
    })
    .catch((err) => {
      console.error("Error connecting to DB", err);
    });
};

export default connectionDB;
