const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	comments: [{
		text: { type: String, required: true },
		username: { type: String, required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: Date.now },
	}],
	deletedAt: {
		type: Date,
		default: null,
	},
	},
	{ 
	timestamps: true,
});

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	hashedPassword: {
		type: String,
		required: true,
	},
	pets: [{
		name: String,
		species: String,
		breed: String,
		gender: String,
		age: Number,
		photo: { type: String, default: "" },
	}],
	posts: [postSchema],
	},
	{
	timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
