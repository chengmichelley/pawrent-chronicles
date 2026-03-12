const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authRequired = require("../middleware/isUserAuthorized");

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.session.user._id);
  res.render("profile", { user });
});

router.get("/users", async (req, res) => {
  if (req.session.user) {
    const users = await User.find();
    res.render("users/index", { users });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
