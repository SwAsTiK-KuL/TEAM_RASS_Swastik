const z = require("zod");
const userSignupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  addressLine1: z.string(),
  city: z.string(),
  district: z.string(),
});
module.exports = userSignupSchema;
