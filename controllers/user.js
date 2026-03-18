const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authRequired = require("../middleware/loggedIn");
const upload = require("../middleware/upload");

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
			return res
				.status(404)
				.render("error", { message: "Users not found" });
		}
		res.render("users/index.ejs", { users: allUsers });
	} catch (error) {
		res.redirect("/");
	}
});

router.get("/:userId", async (req, res) => {
	try {
		const foundUser = await User.findById(req.params.userId);
		if (!foundUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}
		res.render("users/show.ejs", {
			blogOwner: foundUser,
		});
	} catch (error) {
		res.redirect(`/users`);
	}
});

router.post("/:userId/pets", upload.single("photo"), async (req, res) => {
	try {
		const currentUser = await User.findById(req.params.userId);
		if (!currentUser) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		if (!currentUser._id.equals(req.session.user._id)) {
			return res
				.status(401)
				.send("You are not authorized to add pets to this pack!");
		}

		const newPet = {
			name: req.body.name,
			gender: req.body.gender,
			species: req.body.species,
			breed: req.body.breed,
			age: Number(req.body.age) || 0,
			photo: req.file ? req.file.path : "",
		};

		currentUser.pets.push(newPet);

		await currentUser.save();
		res.redirect(`/users/${req.params.userId}`);
	} catch (error) {
		res.redirect(`/users/${req.params.userId}`);
	}

});

router.get("/:userId/pets/:petId/edit", authRequired, async (req, res) => {
	try {
		const blogOwner = await User.findById(req.params.userId);
		if (!blogOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		if (!blogOwner._id.equals(req.session.user._id)) {
			return res.redirect(`/users/${req.params.userId}`);
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

router.put(
	"/:userId/pets/:petId",
	authRequired,
	upload.single("photo"),
	async (req, res) => {
		try {
			const blogOwner = await User.findById(req.params.userId);
			if (!blogOwner) {
				return res
					.status(404)
					.render("error", { message: "User not found" });
			}
			if (!blogOwner._id.equals(req.session.user._id)) {
				return res.status(401).send("You are not authorized to edit!");
			}

			const pet = blogOwner.pets.id(req.params.petId);

			pet.name = req.body.name;
			pet.gender = req.body.gender;
			pet.species = req.body.species;
			pet.breed = req.body.breed;
			pet.age = Number(req.body.age) || 0;

			if (req.file && req.file.path) {
				pet.photo = req.file.path;
			}

			await blogOwner.save();
			res.redirect(`/users/${req.params.userId}`);
		} catch (error) {
			res.redirect(`/users/${req.params.userId}`);
		}
	},
);

router.delete("/:userId/pets/:petId", authRequired, async (req, res) => {
	try {
		const blogOwner = await User.findById(req.params.userId);
		if (!blogOwner) {
			return res
				.status(404)
				.render("error", { message: "User not found" });
		}

		if (!blogOwner._id.equals(req.session.user._id)) {
			return res.status(401).send("You are not authorized to delete!");
		}

		blogOwner.pets.id(req.params.petId).deleteOne();
		await blogOwner.save();

		res.redirect(`/users/${req.params.userId}`);
	} catch (error) {
		res.redirect(`/users/${req.params.userId}`);
	}
});

module.exports = router;
