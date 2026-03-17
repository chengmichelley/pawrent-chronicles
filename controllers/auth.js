const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.get("/sign-up", (req, res) => {
	res.render("auth/sign-up.ejs", { message: "" });
});

router.post("/sign-up", async (req, res) => {
	try {
		const { username, password, confirmPassword } = req.body;
		const foundUser = await User.findOne({ username: username });
		if (foundUser) {
			throw new Error(`User with username ${username} already exist.`);
		}

		if (password !== confirmPassword) {
			throw new Error("Password and password confirm do not match");
		}

		const hashedPassword = bcrypt.hashSync(password, 8);
		const user = await User.create({
			username,
			hashedPassword,
		});
		req.session.user = {
			_id: user._id,
			username: user.username,
		};
		req.session.save(() => {
			res.redirect("/");
		});
	} catch (error) {
		res.render("auth/sign-up", { message: error.message });
	}
});

router.get("/sign-in", (req, res) => {
	res.render("auth/sign-in", { message: "" });
});

router.post("/sign-in", async (req, res) => {
	const { username, password } = req.body;
	try {
		const foundUser = await User.findOne({ username }); // {username: username}
		if (!foundUser) {
			throw new Error(
				`User with username ${username} does not exist. Please sign up.`,
			);
		}

		const isValidPassword = bcrypt.compareSync(
			password,
			foundUser.hashedPassword,
		);
		if (!isValidPassword) {
			throw new Error("Password Incorrect, please try again");
		}
		req.session.user = {
			_id: foundUser._id,
			username: foundUser.username,
		};

		req.session.save(() => {
			res.redirect("/");
		});
	} catch (error) {
		res.render("auth/sign-in", { message: error.message });
	}
});

router.get("/sign-out", (req, res) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});
module.exports = router;
