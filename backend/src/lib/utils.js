import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

export const createTransporter = ()=>{
 return nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});
}



export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 300 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    //sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    sameSite: "none", // only if you want to deploy app on another domain
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
