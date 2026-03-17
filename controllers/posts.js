const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");

//Index '/users/:userId/posts' GET
router.get("/", async (req, res) => {
	try {
		const blogOwner = await User.findById(req.params.userId);
		if (!blogOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		const posts = blogOwner.posts.filter((post) => !post.deletedAt);

		const message = req.session.message;
		req.session.message = null;

		res.render("posts/index.ejs", {
			posts: posts,
			blogOwner: blogOwner,
			message: message || null,
		});
	} catch (error) {
		res.redirect("/");
	}
});

//New '/users/:userId/posts/new' GET

router.get("/new", async (req, res) => {
	try {
		if (req.params.userId !== req.session.user._id) {
			return res.redirect(`/users/${req.params.userId}/posts`);
		}

		const currentUser = await User.findById(req.session.user._id);
		if (!currentUser) {
			return res.status(404).render("error", {
				message: "User not found",
			});
		}
		res.render("posts/new.ejs", { blogOwner: currentUser });
	} catch (error) {
		res.redirect("/");
	}
});

//Create '/users/:userId/posts' POST

router.post("/", async (req, res) => {
	try {
		if (req.params.userId !== req.session.user._id) {
			return res.status(403).send("Unauthorized");
		}
		const currentUser = await User.findById(req.session.user._id);
		if (!currentUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}
		const newPost = req.body.title.trim().toLowerCase();
		const samePost = currentUser.posts.some((post) => {
			return (
				!post.deletedAt && post.title.trim().toLowerCase() === newPost
			);
		});
		if (samePost) {
			req.session.message = "Post is already in Posted!";
			return res.redirect(`/users/${req.session.user._id}/posts`);
		}

		req.session.message = null;
		currentUser.posts.push({
			title: req.body.title,
			content: req.body.content,
		});

		currentUser.markModified("posts");

		await currentUser.save();
		res.redirect(`/users/${req.session.user._id}/posts`);
	} catch (error) {
		res.redirect("/");
	}
});

//Show '/users/:userId/posts/:postId' GET

router.get("/:postId", async (req, res) => {
	try {
		const blogOwner = await User.findById(req.params.userId);
		if (!blogOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		const post = blogOwner.posts.id(req.params.postId);
		if (!post || post.deletedAt) {
			return res
				.status(404)
				.render("error", { message: "Post not found" });
		}

		res.render("posts/show.ejs", {
			post: post,
			blogOwner: blogOwner,
		});
	} catch (error) {
		res.redirect(`/users/${req.params.userId}/posts`);
	}
});

//Edit '/users/:userId/posts/:postId/edit' GET

router.get("/:postId/edit", async (req, res) => {
	try {
		if (req.params.userId !== req.session.user._id) {
			return res.redirect(`/users/${req.params.userId}/posts`);
		}
		const currentUser = await User.findById(req.session.user._id);
		if (!currentUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}
		const post = currentUser.posts.id(req.params.postId);
		if (!post) {
			return res
				.status(404)
				.render("error", { message: "Post not found" });
		}
		res.render("posts/edit.ejs", { post: post, blogOwner: currentUser });
	} catch (error) {
		res.redirect(`/`);
	}
});

//Update '/users/:userId/posts/:postId' PUT

router.put("/:postId", async (req, res) => {
	try {
		if (req.params.userId !== req.session.user._id) {
			return res.status(403).send("Unauthorized");
		}
		const currentUser = await User.findById(req.session.user._id);
		if (!currentUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}
		const postUpdate = currentUser.posts.id(req.params.postId);
		if (!postUpdate) {
			return res
				.status(404)
				.render("error", { message: "Cannot find post" });
		}

		const isDeleted = req.body.deletedAt === "on" ? new Date() : null;

		postUpdate.set({
			title: req.body.title,
			content: req.body.content,
			deletedAt: isDeleted,
		});

		await currentUser.save();
		res.redirect(`/users/${req.session.user._id}/posts`);
	} catch (error) {
		res.redirect(`/`);
	}
});

//Soft Delete '/users/:userId/posts/:postId SoftDelete

router.delete("/:postId", async (req, res) => {
	try {
		if (req.params.userId !== req.session.user._id) {
			return res.status(403).send("Unauthorized");
		}
		const currentUser = await User.findById(req.session.user._id);
		if (!currentUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}
		const post = currentUser.posts.id(req.params.postId);
		if (!post) {
			return res
				.status(404)
				.render("error", { message: "Cannot find post" });
		}
		post.deletedAt = new Date();

		await currentUser.save();
		res.redirect(`/users/${req.session.user._id}/posts`);
	} catch (error) {
		res.redirect("/");
	}
});

router.post("/:postId/comments", async (req, res) => {
	try {
		const postOwner = await User.findById(req.params.userId);
		if (!postOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		const post = postOwner.posts.id(req.params.postId);
		if (!post) {
			return res
				.status(404)
				.render("error", { message: "Cannot find post" });
		}

		post.comments.push({
			text: req.body.text,
			username: req.session.user.username,
		});

		await postOwner.save();

		res.redirect(`/users/${req.params.userId}/posts/${req.params.postId}`);
	} catch (error) {
		res.redirect(`/users/${req.params.userId}/posts/${req.params.postId}`);
	}
});

router.delete("/:postId/comments/:commentId", async (req, res) => {
	try {
		const postOwner = await User.findById(req.params.userId);
		if (!postOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		const post = postOwner.posts.id(req.params.postId);
		if (!post) {
			return res
				.status(404)
				.render("error", { message: "Cannot find post" });
		}

		const comment = post.comments.id(req.params.commentId);

		const isBlogOwner = postOwner._id.equals(req.session.user._id);

		const isCommentor = comment.username === req.session.user.username;

		if (isBlogOwner || isCommentor) {
			comment.deleteOne();
			await postOwner.save();
			res.redirect(
				`/users/${req.params.userId}/posts/${req.params.postId}`,
			);
		} else {
			return res
				.status(403)
				.render("error", { message: "Unauthorized User" });
		}
	} catch (error) {
		res.redirect(`/users/${req.params.userId}/posts/${req.params.postId}`);
	}
});

module.exports = router;
