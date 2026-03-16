const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authRequired = require("../middleware/loggedIn");

router.get("/me", authRequired, async (req, res) => {
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) {
    return res.status(404).render("error", { message: "User not found" });
  }
  res.render("users/show.ejs", { blogOwner: currentUser });
});

router.get("/", async (req, res) => {
  try {
    const allUsers = await User.find({});
    if (!allUsers) {
      return res.status(404).render("error", { message: "Users not found" });
    }
    console.log("Users found in DB:", allUsers);
    res.render("users/index.ejs", { users: allUsers });
  } catch (error) {
    console.log(`Error Loading Users`);
    res.redirect("/");
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const foundUser = await User.findById(req.params.userId);
    if (!foundUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("users/show.ejs", {
      blogOwner: foundUser,
    });
  } catch (error) {
    console.log("SHOW Error", error);
    res.redirect(`/users`);
  }
});

module.exports = router;
