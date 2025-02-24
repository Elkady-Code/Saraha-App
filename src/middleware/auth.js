import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/index.js";

export const roles = {
  user: "user",
  admin: "admin",
};

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  const [prefix, token] = authorization.split(" ") || [];
  if (!prefix || !token) {
    return next(new Error("Missing Authorization Header", { cause: 400 }));
  }
  let SIGNATURE = undefined;
  if (prefix === "Bearer") {
    SIGNATURE = process.env.SIGNATURE_TOKEN_USER;
  } else if (prefix === "Admin") {
    SIGNATURE = process.env.SIGNATURE_TOKEN_ADMIN;
  } else {
    return next(new Error("Invalid Authorization token", { cause: 401 }));
  }
  const decoded = jwt.verify(token, SIGNATURE);
  if (!decoded?.id) {
    return next(new Error("Invalid token payload", { cause: 400 }));
  }
  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new Error("User not found", { cause: 401 }));
  }
  if (user?.isDelete) {
    return next(new Error("User account has been deleted", { cause: 401 }));
  }
  if (user.passwordChangedAt && parseInt(user.passwordChangedAt.getTime() / 1000) > decoded.iat) {
    return next(new Error("Token expired, login again", { cause: 401 }));
  }
  req.user = user;
  next();
};
export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req?.user?.role)) {
      return next(new Error("Access Denied", { cause: 403 }));
    }
    next();
  });
};
