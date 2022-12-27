const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectDatabase = () => {
	mongoose
		.connect(process.env.DB_LOCAL_URI, {
			useNewUrlParser: true,
		})
		.then((con) => {
			console.log(
				`MongoDB Database connected with HOST: ${con.connection.host}`
			);
		})
		.catch((error) => {
			console.log(error);
		});
};

module.exports = connectDatabase;
