require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

if (process.env.CLOUDINARY_URL) {
	cloudinary.config({
		cloudinary_url: process.env.CLOUDINARY_URL,
	});
} else {
	cloudinary.config({
		cloud_name: process.env.CLOUD_NAME,
		api_key: process.env.API_KEY,
		api_secret: process.env.API_SECRET,
	});
}

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "pawrent_chronicles",
		allowed_formats: ["jpg", "png", "jpeg"], // Ensure underscore version
	},
});

const upload = multer({ storage: storage });
module.exports = upload;
