const Product = require("../models/product");

const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const products = require("../data/product.json");

//settings dotenv file
dotenv.config({ path: "backend/config/config.env" });

connectDatabase();

const seedProduct = async () => {
	try {
		await Product.deleteMany();
		console.log("All products deleted.");
		await Product.insertMany(products);
		console.log("All products inserted.");

		process.exit();
	} catch (error) {
		console.log(error);
		process.exit();
	}
};
seedProduct();
