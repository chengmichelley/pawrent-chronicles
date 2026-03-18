const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config();
console.log("Cloudinary Config Check:", cloudinary.config().cloud_name);

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "pawrent_chronicles",
		allowed_formats: ["jpg", "png", "jpeg"],
	},
});

const upload = multer({ storage: storage });
module.exports = upload;
