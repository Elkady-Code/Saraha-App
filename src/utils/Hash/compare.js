import bcrypt from "bcrypt";

export const Compare = async ({ password, hashPassword }) => {
  return await bcrypt.compareSync(password, hashPassword);
};
