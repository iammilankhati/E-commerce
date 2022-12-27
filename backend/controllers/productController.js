const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsync = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/APIFeatures');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Create new Product => /api/v1/admin/product/new
module.exports.newProduct = catchAsync(async (req, res, next) => {
	req.body.user = req.user[0].id;
	const product = await Product.create(req.body);
	res.status(201).json({
		success: true,
		product,
	});
});
// Get all products => /api/v1/products
module.exports.getProducts = catchAsync(async (req, res, next) => {
	const resPerPage = 4;
	const productCount = await Product.countDocuments();
	const apiFeature = new APIFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resPerPage);

	const product = await apiFeature.query;
	res.status(200).json({
		success: true,
		count: product.length,
		productCount,
		product,
	});
});

// Get single product => /api/v1/product/:id

module.exports.getSingleProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findOne({ _id: req.params.id });

	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}

	res.status(200).json({ success: true, product });
});

// Update product => /api/v1/admin/product/:id

module.exports.updateProduct = catchAsync(async (req, res, next) => {
	const { id: ProductID } = req.params;

	const product = await Product.findOneAndUpdate({ _id: ProductID }, req.body, {
		new: true,
		runValidators: true,
	});

	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	return res.status(200).json({ success: true, product });
});

// delete product => /api/v1/admin/product/:id

module.exports.deleteProduct = catchAsync(async (req, res, next) => {
	const { id: ProductID } = req.params;

	const product = await Product.findOneAndDelete({ _id: ProductID });
	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	return res
		.status(200)
		.json({ success: true, message: 'Product is deleted', product });
});

// Create new review => /api/v1/review
exports.createProductReview = catchAsync(async (req, res, next) => {
	const { rating, comment, productId } = req.body;
	const review = {
		user: req.user[0]._id,
		name: req.user[0].name,
		rating: Number(rating),
		comment,
	};

	const product = await Product.findOne({ _id: productId });
	const isReviewed = product.reviews.find(
		(r) => r.user.toString() === req.user[0]._id.toString()
	);

	if (isReviewed) {
		product.reviews.forEach((review) => {
			if (review.user.toString() === req.user[0]._id.toString()) {
				review.comment = comment;
				review.rating = Number(rating);
			}
		});
	} else {
		product.reviews.push(review);
		product.numOfReviews = product.reviews.length;
	}

	product.ratings =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		product.reviews.length;

	await product.save({ validateBeforeSave: false });
	res.status(200).json({
		success: true,
	});
});

// Get Product Reviews = > /api/v1/reviews/:id

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	res.status(200).json({ success: true, reviews: product.reviews });
});
// Delete Product Reviews = > /api/v1/reviews/:id

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);
	const reviews = product.reviews.filter(
		(review) => review._id.toString() !== req.query.id.toString()
	);

	const numOfReviews = reviews.length;
	const ratings = (product.ratings =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		reviews.length);

	await Product.findByIdAndUpdate(
		req.query.productId,
		{
			reviews,
			ratings,
			numOfReviews,
		},
		{
			new: true,
			runValidators: true,
		}
	);
	res.status(200).json({ success: true, reviews: product.reviews });
});
