const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltrounds = 11;
router = express.Router();
const JWT_SECRET = require("../config");
const { sellerSignupSchema, sellerSigninSchema } = require("./sellerSchema");
const { SellerDb } = require("../db/db");
const sellerAuthMiddleware = require("./sellerMiddleware");
router.post("/signup", async (req, res) => {
  const sellerSignupData = req.body;
  const parsedPayload = sellerSignupSchema.safeParse(sellerSignupData);
  let isSellerPresent = null;
  try {
    isSellerPresent = await SellerDb.find({
      $or: [
        { username: parsedPayload.data.username },
        { email: parsedPayload.data.email },
      ],
    });
  } catch (err) {
    console.log(err);
  }
  if (parsedPayload.success) {
    if (isSellerPresent.length > 0) {
      res.status(403).json({ msg: "Seller exist in db" });
    } else {
      let hashedPassword;
      try {
        let unhashedSellerData = parsedPayload.data;
        try {
          hashedPassword = await bcrypt.hash(
            parsedPayload.data.password,
            saltrounds
          );
        } catch (err) {
          console.log(err);
          res.status(400).json({ msg: "Error signing up" });
        }
        const finalSellerData = {
          ...unhashedSellerData,
          password: hashedPassword,
        };
        await SellerDb.create(finalSellerData);
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
  const sellerSigninData = req.body;
  const parsedPayload = sellerSigninSchema.safeParse(sellerSigninData);
  if (!parsedPayload.success) {
    res.status(400).json({ msg: "Invalid Credentials" });
    return;
  }
  try {
    const seller = await SellerDb.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!seller) {
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Compare hashed password with provided password
    const passwordMatch = await bcrypt.compare(password, seller.password);

    if (!passwordMatch) {
      // Passwords don't match
      return res.status(401).json({ msg: "Invalid username or password" });
    }

    // Passwords match, generate JWT token
    const token = jwt.sign({ username: seller.username }, JWT_SECRET);
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error signing in:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.post("/postProduct", sellerAuthMiddleware, async (req, res) => {
  console.log(req.seller);
  res.status(200).json({});
});
module.exports = router;
