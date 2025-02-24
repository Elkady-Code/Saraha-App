import bcrypt from "bcrypt";
export const Hashing = async ({ password, SALT_ROUND = +process.env.SALT_ROUND }) => {
  return await bcrypt.hash(password, +SALT_ROUND);
};

