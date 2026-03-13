const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require('../models/user.js')

//Index '/users/:userId/posts' GET
router.get('/', async (req, res)=>{
    try {
        const currentUser = await User.findById(req.params.userId);
        if(!currentUser) {
            return res.status(404).render('error', { message: "User not found" });
        }
        res.locals.posts = currentUser.posts.filter(post=> !post.deletedAt);

        const message = req.session.message;
        req.session.message = null;
        res.render('posts/index.ejs')
    } catch (error) {
        console.log("Index Error", error);
        res.redirect('/')
    }
});

//New '/users/:userId/posts/new' GET

router.get('/new', async(req, res)=> {
    try{
        const currentUser = await User.findById(req.params.userId);
        if(!currentUser) {
            return res.status(404).render('error', {
                message: 'User not found'});
        }
        res.render('posts/new.ejs', { userId: req.params.userId });
    } catch (error) {
        res.redirect('/');
    }
});

//Create '/users/:userId/posts' POST

router.post("/", async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    const newPost = req.body.title.trim().toLowerCase();
    const samePost = currentUser.posts.some((post) => {
      return !post.deletedAt && post.title.trim().toLowerCase() === newPost;
    });
    if (samePost) {
      req.session.message = "Post is already in Posted!";
      return res.redirect(`/users/${req.session.user._id}/posts`);
    }

    req.session.message = null;
    currentUser.posts.push(req.body);
    currentUser.markModified("posts");

    await currentUser.save();
    res.redirect(`/users/${req.session.user._id}/posts`);
  } catch (error) {
    console.log("POST error", error);
    res.redirect("/");
  }
});

//Show '/users/:userId/posts/:postId' GET

router.get("/:postId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    const post = currentUser.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).render("error", { message: "Post not found" });
    }
    res.render("posts/show.ejs", { post: post });
  } catch (error) {
    console.log("SHOW Error", error);
    res.redirect(`/users/${req.params.userId}/posts`);
  }
});

//Edit '/users/:userId/posts/:postId/edit' GET

router.get("/:postId/edit", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    const post = currentUser.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).render("error", { message: "Post not found" });
    }
    res.render("posts/edit.ejs", { post });
  } catch (error) {
    res.redirect(`/`);
  }
});

//Update '/users/:userId/posts/:postId' PUT

router.put("/:postId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).render("error", { message: "User not found" });
    }
    const postUpdate = currentUser.posts.id(req.params.postId);
    if (!postUpdate) {
      return res
        .status(404)
        .render("error", { message: "Cannot find post" });
    }

    postUpdate.set(req.body);
    await currentUser.save();
    res.redirect(`/users/${req.params.userId}/posts`);
  } catch (error) {
    res.render("UPDATE error", error);
    res.redirect(`/`);
  }
});

//Soft Delete '/users/:userId/posts/:postId SoftDelete

router.delete('/:postId', async (req, res)=> {
    try {
        const currentUser = await User.findById(req.session.user._id);
        if (!currentUser) {
          return res.status(404).render("error", { message: "User not found" });
        }
        const post = currentUser.posts.id(req.params.postId);
        if (!post) {
          return res.status(404).render("error", { message: "Cannot find post" });
        }
        post.deletedAt = new Date();

        await currentUser.save();
        res.redirect(`/users/${currentUser._id}/posts`);
    } catch (error) {
        res.redirect('/');
    }
});

module.exports = router;