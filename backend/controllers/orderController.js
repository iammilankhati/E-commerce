const Order = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

//create a new Order => /api/v1/order/new

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
	const {
		orderItems,
		shippingInfo,
		itemPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paymentInfo,
	} = req.body;

	const order = await Order.create({
		orderItems,
		shippingInfo,
		itemPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		paymentInfo,
		paidAt: Date.now(),
		user: req.user[0].id,
	});
	res.status(200).json({
		success: true,
		order,
	});
});

//Get Single Order => /api/v1/order/:id

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.params;
	const order = await Order.findOne({ _id: id }).populate('user', 'name email');
	if (!order) {
		return next(new ErrorHandler(`No order with the id ${id}`, 404));
	}
	res.status(200).json({
		success: true,
		order,
	});
});

//Get Logged In user Order => /api/v1/order/me/

exports.myOrder = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find({ user: req.user[0].id });
	if (!orders) {
		return next(new ErrorHandler(`No order exist`, 404));
	}
	res.status(200).json({
		success: true,
		count: orders.length,
		orders,
	});
});
//Get total orders by admin => /api/v1/admin/orders/

exports.allOrders = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find({});
	if (!orders) {
		return next(new ErrorHandler(`No order exist`, 404));
	}

	let totalAmount = 0;
	orders.forEach((order) => {
		totalAmount += order.totalPrice;
	});
	res.status(200).json({
		success: true,
		count: orders.length,
		totalAmount,
		orders,
	});
});
//Update/ Prcess order => /api/v1/admin/update/order/:id

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findOne({ _id: req.params.id });

	if (order.orderStatus === 'Delivered') {
		return next(new ErrorHandler('You have already delivered this order', 400));
	}

	order.orderItems.forEach(async (item) => {
		await updateStock(item.product, item.quantity);
	});
	order.orderStatus = req.body.status;
	order.deliveredAt = Date.now();

	await order.save();
	res.status(200).json({
		success: true,
	});
});
async function updateStock(id, quantity) {
	const product = await Product.findOne({ _id: id });

	product.stock = product.stock - quantity;
	await product.save({ validateBeforeSave: false });
}

// Delete order =>/api/v1/admin/order/:id

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findOne({ _id: req.params.id });
	if (!order) {
		return next(new ErrorHandler(`No order with the id ${req.params.id}`, 404));
	}

	await order.remove();
	res.status(200).json({
		success: true,
	});
});
