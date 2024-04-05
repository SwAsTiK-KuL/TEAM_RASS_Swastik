const mongoose = require("mongoose");
require("dotenv").config();
const DatabaseUrl = process.env.DATABASE_URL;
console.log(DatabaseUrl);
mongoose.connect(DatabaseUrl).then(() => {
  console.log("Db connected");
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Assuming you want to validate email format
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
});

const UserDB = mongoose.model("User", userSchema);

module.exports = UserDB;
