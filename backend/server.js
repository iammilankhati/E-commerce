const app = require("./app");
const connectDatabse = require("./config/database");
const dotenv = require("dotenv");

//handle the uncaught exception : make sure it is in top
process.on("uncaughtException", (err) => {
	console.log(`ERROR:: ${err.message}`);
	console.log(`Shutting down the server for uncaught exception`);
	process.exit(1);
});

/* setting for config file */
dotenv.config({ path: "backend/config/config.env" });
//Connecting to Database
connectDatabse();
const server = app.listen(process.env.PORT, () => {
	console.log(
		`Server is running on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
	);
});

//Handle handled Promise rejections
process.on("unhandledRejection", (err) => {
	console.log(`ERROR: ${err.message}`);
	console.log(`Shutting down the server due to unhandled promise rejection`);
	server.close(() => {
		process.exit(1);
	});
});
