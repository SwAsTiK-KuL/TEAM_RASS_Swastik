const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltrounds = 11;
router = express.Router();
const JWT_SECRET = require("../config");
const { userSignupSchema, userSigninSchema } = require("./userSchema");
const { UserDB } = require("../db/db");
const userAuthMiddleware = require("./userMiddleware");
router.post("/signup", async (req, res) => {
  const userSignupData = req.body;
  const parsedPayload = userSignupSchema.safeParse(userSignupData);
  let isUserPresent = null;
  try {
    isUserPresent = await UserDB.find({
      $or: [
        { username: parsedPayload.data.username },
        { email: parsedPayload.data.email },
      ],
    });
  } catch (err) {
    console.log(err);
  }
  if (parsedPayload.success) {
    if (isUserPresent.length > 0) {
      res.status(403).json({ msg: "User exist in db" });
    } else {
      let hashedPassword;
      try {
        let unhashedUserData = parsedPayload.data;
        try {
          hashedPassword = await bcrypt.hash(
            parsedPayload.data.password,
            saltrounds
          );
        } catch (err) {
          console.log(err);
          res.status(400).json({ msg: "Error signing up" });
        }
        const finalUserData = { ...unhashedUserData, password: hashedPassword };
        await UserDB.create(finalUserData);
      } catch (err) {
        console.log(err);
        res.status(403).json({ msg: "Error signing in" });
        return;
      }
      const token = jwt.sign(parsedPayload.data.username, JWT_SECRET);
      res.status(200).json({ token: token });
      return;
    }
  }
});
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const userSigninData = req.body;
  const parsedPayload = userSigninSchema.safeParse(userSigninData);
  if (!parsedPayload.success) {
    res.status(400).json({ msg: "Invalid Credentials" });
    return;
  }
  try {
    // Find user by username or email
    const user = await UserDB.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      // User not found
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Compare hashed password with provided password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Passwords don't match
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Passwords match, generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error signing in:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get("/allProducts", userAuthMiddleware, async (req, res) => {
  res.status(200).json({ msg: "middleware success" });
});
module.exports = router;
