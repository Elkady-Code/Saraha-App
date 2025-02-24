import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import {
  asyncHandler,
  eventEmitter,
  Hashing,
  Compare,
  Encrypt,
  Decrypt,
  generateToken,
  verifyToken,
} from "../../utils/index.js";

// Sign Up User
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, cPassword, phone, gender } = req.body;

  // Check password if matches or not
  if (password !== cPassword) {
    return next(new Error("Password doesn't match", { cause: 400 }));
  }
  // Check Email exist or not
  const emailExist = await userModel.findOne({ email });
  if (emailExist) {
    return next(new Error("Email already exists.", { cause: 400 }));
  }
  // Hash password

  const hash = await Hashing({ password, SALT_ROUND: process.env.SALT_ROUND });

  // Encrypt phone
  const encryptPhone = await Encrypt({
    key: phone,
    SECRET_KEY: process.env.SECRET_KEY,
  });

  //Send Email Notification

  eventEmitter.emit("sendEmail", { email });

  // Create
  const user = await userModel.create({
    name,
    email,
    password: hash,
    phone: encryptPhone,
    gender,
  });
  return res.status(200).json({ message: "User created successfully", user });
});

// Confirm Email
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    return next(new Error("Token not found", { cause: 400 }));
  }
  const decoded = await verifyToken({
    token,
    SIGNATURE: process.env.SIGNATURE_EMAIL_CONFIRMATION,
  });

  if (!decoded?.email) {
    return next(new Error("Invalid token payload", { cause: 400 }));
  }

  const user = await userModel.findOneAndUpdate(
    {
      email: decoded.email,
      confirmed: false,
    },
    { confirmed: true }
  );
  if (!user) {
    return next(new Error("User not found", { cause: 400 }));
  }

  return res.status(200).json({ message: "User confirmed successfully" });
});

// Sign In
export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, confirmed: true });
  if (!user) {
    return next(new Error("Invalid email or not confirmed", { cause: 400 }));
  }

  // Check password
  const match = await Compare({ password, hashPassword: user.password });
  if (!match) {
    return next(new Error("Invalid password", { cause: 400 }));
  }

  // Generate token
  const token = await generateToken({
    payload: { email, id: user._id },
    SIGNATURE:
      user.role === "user"
        ? process.env.SIGNATURE_TOKEN_USER
        : process.env.SIGNATURE_TOKEN_ADMIN,
  });
  return res.status(200).json({ message: "Login successful", token });
});

// Get Profile
export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = Decrypt({
    key: req.user.phone,
    SECRET_KEY: process.env.SECRET_KEY,
  });
  const messages = await messageModel.find({ userId: req.user._id });
  return res.status(200).json({ message: "Done", user: req.user, messages });
});

// Share Profile
export const shareProfile = asyncHandler(async (req, res, next) => {
  const user = await userModel
    .findById(req.params.id)
    .select("-_id name email phone");

  user
    ? res.status(200).json({ message: "Done", user })
    : res.status(404).json({ message: "User not found" });
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await Encrypt({
      key: req.body.phone,
      SECRET_KEY: process.env.SECRET_KEY,
    });
  }
  const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  return res.status(200).json({ message: "Done", user });
});

// Update Password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!Compare({ password: oldPassword, hashPassword: req.user.password })) {
    return next(new Error("Invalid password entered", { cause: 400 }));
  }

  const hash = await Hashing({
    password: newPassword,
    SALT_ROUND: +process.env.SALT_ROUND,
  });

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: hash, passwordChangedAt: Date.now() },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "Password updated successfully", user });
});

// Freeze Account (Soft Delete)
export const freezeAccount = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { isDeleted: true, passwordChangedAt: Date.now() },
    { new: true }
  );

  return res.status(200).json({ message: "User Account Frozen", user });
});
