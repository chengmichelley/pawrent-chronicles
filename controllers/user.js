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

router.post("/:userId/pets", async (req, res)=> {
  try {
    const currentUser = await User.findById(req.params.userId);
      if (!currentUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    currentUser.pets.push(req.body);
    currentUser.markModified("pets");

    await currentUser.save();
    res.redirect(`/users/${req.params.userId}`);
  } catch (error) {
    console.log(error);
    res.redirect(`/users/${req.params.userId}`);
  }
});

router.get("/:userId/pets/:petId/edit", authRequired, async (req, res)=> {
  try {
    const blogOwner = await User.findById(req.params.userId);
    if (!blogOwner) {
      return res.status(404).render("error", { message: "User not found" });
    }

    const pet = blogOwner.pets.id(req.params.petId);
    if (!pet) {
      return res.redirect(`/users/${req.params.userId}`);
    }

    res.render("users/petEdit.ejs", { blogOwner, pet });
  } catch (error) {
    res.redirect(`/user/${req.params.userId}`);
  }
});

router.put("/:userId/pets/:petId", authRequired, async (req, res)=> {
  try {
    const blogOwner = await User.findById(req.params.userId);
    if (!blogOwner) {
      return res.status(404).render("error", { message: "User not found" });
    }

    const pet = blogOwner.pets.id(req.params.petId);
    if (!pet) {
      return res.redirect(`/users/${req.params.userId}`);
    }

    pet.set(req.body);
    await blogOwner.save();

    res.redirect(`/users/${req.params.userId}`);
  } catch (error) {
    res.redirect(`/users/${req.params.userId}`);
  }
});

router.delete("/:userId/pets/:petId", authRequired, async (req, res)=> {
  try {
    const blogOwner = await User.findById(req.params.userId);
    if (!blogOwner) {
      return res.status(404).render("error", { message: "User not found" });
    }

    blogOwner.pets.id(req.params.petId).deleteOne();
    await blogOwner.save();

    res.redirect(`/users/${req.params.userId}`);
  } catch (error) {
    res.redirect(`/users/${req.params.userId}`);
  }
});

module.exports = router;
