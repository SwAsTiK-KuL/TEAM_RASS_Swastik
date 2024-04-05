const z = require("zod");
const sellerSignupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  addressLine1: z.string(),
  password: z.string().min(8),
  city: z.string(),
  district: z.string(),
});
const sellerSigninSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});
module.exports = { sellerSignupSchema, sellerSigninSchema };
