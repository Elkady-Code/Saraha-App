import cors from "cors";
import connectionDB from "./DB/connectionDB.js";
import messageRouter from "./modules/messages/message.controller.js";
import userRouter from "./modules/users/user.controller.js";
import { globalErrorHandler } from "./utils/Error/index.js";

const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(cors());
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "Hello on Sara7a App" });
  });

  connectionDB();

  app.use("*", (req, res, next) => {
    return next(new Error(`Invalid URL: ${req.originalUrl}`));
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
