// initialized backend and frontend
const express = require("express");
const app = express();
const userRouter = require("./userRoutes/user");
app.use(express.json());
app.use("/user", userRouter);
app.listen(3000, () => {
  console.log("on port 3000");
});
