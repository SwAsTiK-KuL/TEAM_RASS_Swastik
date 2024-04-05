const z = require("zod");
const userSignupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  addressLine1: z.string(),
  password: z.string().min(8),
  city: z.string(),
  district: z.string(),
});
const userSigninSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});
module.exports = { userSignupSchema, userSigninSchema };
