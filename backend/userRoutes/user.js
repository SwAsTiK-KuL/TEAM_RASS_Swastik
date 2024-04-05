const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken");
router = express.Router();
const JWT_SECRET = require("../config");
const userSignupSchema = require("./userSchema");
const UserDB = require("../db/userDb");
router.post("/signup", async (req, res) => {
  const userData = req.body;
  const parsedPayload = userSignupSchema.safeParse(userData);
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
      try {
        await UserDB.create(parsedPayload.data);
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
module.exports = router;
