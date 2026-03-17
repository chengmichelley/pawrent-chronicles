const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
	console.log(`MongoDB connected to ${mongoose.connection.name}`);
});

mongoose.connection.on("error", (error) => {
	console.log(`MongoDB connected to ${error.message}`);
});
