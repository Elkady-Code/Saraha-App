import { Router } from "express";
import * as MS from "./message.service.js";
import * as MV from "./message.validation.js";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/auth.js";
const messageRouter = Router();

messageRouter.get("/", authentication, MS.getMessage);
messageRouter.post("/", validation(MV.sendMessageSchema), MS.sendMessage);

export default messageRouter;
