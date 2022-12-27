const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter product name'],
		trim: true,
		maxlength: [100, 'Product must be less than 100 characters'],
	},

	price: {
		type: Number,
		required: [true, 'Please enter product price'],
		maxlength: [5, 'Product price must be less than 5 characters'],
		default: 0.0,
	},
	description: {
		type: String,
		required: [true, 'Please enter product description'],
		trim: true,
	},
	ratings: {
		type: Number,
		default: 0,
	},
	images: [
		{
			public_id: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
	],
	category: {
		type: String,
		required: [true, 'Please select category'],
		enum: {
			values: [
				'Electronics',
				'Cameras',
				'Laptop',
				'Accessory',
				'Headphones',
				'Books',
				'Food',
				'Clothes',
				'Shoes',
				'Health',
				'Outdoor',
				'Home',
			],
			message: 'Please select correct category',
		},
	},
	seller: {
		type: String,
		required: [true, 'Please enter seller name'],
	},
	stock: {
		type: Number,
		required: [true, 'Please enter product stock'],
		maxlength: [5, 'Product stock must be less than 5 characters'],
		default: 0,
	},
	numOfReviews: {
		type: Number,
		default: 0,
	},

	reviews: [
		{
			user: {
				type: mongoose.Schema.ObjectId,
				ref: 'User',
				required: true,
			},
			name: {
				type: String,
				required: true,
				trim: true,
			},
			rating: {
				type: Number,
				required: true,
			},
			comment: {
				type: String,
				required: true,
			},
		},
	],
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Product', productSchema);
