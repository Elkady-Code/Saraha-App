import { Router } from "express";
import * as US from "./user.service.js";
import { authentication, authorization, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./user.validation.js";
const userRouter = Router();

userRouter.post("/signUp", validation(UV.signUpSchema), US.signUp);
userRouter.post("/signIn", validation(UV.signInSchema), US.signIn);
userRouter.get("/confirmEmail/:token", US.confirmEmail);
userRouter.get("/profile", authentication, US.getProfile);
userRouter.get(
  "/profile/:id",
  validation(UV.shareProfileSchema),
  US.shareProfile
);
userRouter.patch(
  "/update",
  validation(UV.updateProfileSchema),
  authentication,
  US.updateProfile
);
userRouter.patch(
  "/update/password",
  validation(UV.updatePasswordSchema),
  authentication,
  US.updatePassword
);
userRouter.delete(
  "/freeze",
  validation(UV.freezeAccountSchema),
  authentication,
  US.freezeAccount
);
export default userRouter;
