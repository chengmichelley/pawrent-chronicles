require("dotenv").config();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

if(process.env.CLOUDINARY_URL) {
  cloudinary.config({
        cloudinary_url: process.env.CLOUDINARY_URL
    });
} else {
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
};

console.log("Cloudinary Config Check:", cloudinary.config().cloud_name);

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file)=> {
		return {
			folder: "pawrent_chronicles",
			allowed_formats: ["jpg", "png", "jpeg"],
			public_id: file.filename + '-' + Date.now(),
	};
}
});

const upload = multer({ storage: storage });
module.exports = upload;
