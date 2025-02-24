import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendEmail.js";
import { generateToken } from "../Token/generateToken.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
  const { email } = data;
  const token = await generateToken({
    payload: { email },
    SIGNATURE: process.env.SIGNATURE_EMAIL_CONFIRMATION,
    option: { expiresIn: "10m" },
  });
  const confirmEmail = `http://elkadysaraha.eu-4.evennode.com/users/confirmEmail/${token}`;
  await sendEmail(
    email,
    "Confirm Email",
    `<a href='${confirmEmail}'>Confirm Me</a>`
  );
});
