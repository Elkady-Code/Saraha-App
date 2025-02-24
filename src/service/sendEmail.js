import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html, attachments) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"Ibrahim 👻" <ibrahimallie905@gmail.com>',
    to: to ? to : "ibrahimallie905@gmail.com",
    subject: subject ? subject : "Hello there",
    html: html ? html : "<b> Sent to you </b>",
    attachments: attachments ? attachments : [],
  });

  if (info.accepted.length) {
    return true;
  }
  return false;
};
