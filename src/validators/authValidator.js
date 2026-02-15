// zod schemas for signup, login, verify otp
const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
});

const loginSchema = z.object({
  phone: z.string().min(10, "Phone is required"),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(["signup", "login"]),
});

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
};
