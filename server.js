require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const methodOverride = require("method-override");
const authController = require("./controllers/auth");
const userController = require("./controllers/user");
const postsController = require("./controllers/posts");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const loggedIn = require("./middleware/loggedIn.js");
const passDataToView = require("./middleware/passDataToView.js");

require("./db/connection");

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
		}),
	}),
);
app.use(passDataToView);

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.render("index");
});

app.use("/auth", authController);

app.use(loggedIn);
app.use("/users", userController);

app.use("/users/:userId/posts", postsController);

app.listen(PORT, () => console.log(`The port is running on: ${PORT}`));
