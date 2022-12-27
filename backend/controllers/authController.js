const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsync = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// Register a user => /api/v1/register

exports.registerUser = catchAsync(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: '5678901234',
			url: 'https://www.example.com/solopro.jpg',
		},
	});
	const token = user.getJwtToken();

	res.status(201).json({
		success: true,
		token,
	});
});

//Login user = > /api/v1/login
exports.loginUser = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	//check if email and pasword are provided
	if (!email || !password) {
		return next(new ErrorHandler('Please Enter & Password', 400));
	}
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorHandler('Invalid Email and Password', 401));
	}

	// Check if password is correct or not
	const isPasswordMatch = await user.comparePassword(password);

	if (!isPasswordMatch) {
		return next(new ErrorHandler('Invalid Email and Password', 401));
	}
	sendToken(user, 200, res);
});
//Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ErrorHandler('User not found with this email.', 400));
	}

	// Get reset token

	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });

	//Create reset password url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/password/reset/${resetToken}`;
	const message = `Your password reset token is as follow: \n\n ${resetUrl} \n\n If you have not requestd this email, then ignore it.`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Bazar Password Recovery`,
			message,
		});
		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email}`,
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save({ validateBeforeSave: false });
		return next(new ErrorHandler(message, 500));
	}
});

//Forgot Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsync(async (req, res, next) => {
	//Hash URL token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorHandler('Reset  Token Invalid or Expired', 400));
	}
	if (req.body.password !== req.body.confirmedPassword) {
		return next(new ErrorHandler('Passwords do not match', 400));
	}

	// Setup new Password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();

	sendToken(user, 200, res);
});

//Get currently logged in user details = > /api/v1/me

exports.getUserProfile = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ _id: req.user[0].id });
	res.status(200).json({
		success: true,
		user,
	});
});

//Update / change password  => /api/v1/password/update
exports.updatePassword = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ _id: req.user[0].id }).select('+password');
	//check previous user password
	const isMatched = await user.comparePassword(req.body.oldPassword);
	if (!isMatched) {
		return next(new ErrorHandler('Old password does not match', 400));
	}

	user.password = req.body.password;
	await user.save();

	sendToken(user, 200, res);
});

//Update user Profile => /api/v1/me/update

exports.updateProfile = catchAsync(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
	};

	//Update avatar :TODO
	const user = await User.findOneAndUpdate(
		{ _id: req.user[0].id },
		newUserData,
		{ new: true, runValidators: true }
	);
	res.status(200).json({
		success: true,
	});
});

//Logout user = > /api/v1/logout

exports.logoutUser = catchAsync(async (req, res, next) => {
	res.cookie('token', null, {
		expiresIn: new Date(Date.now()),
		httpOnly: true,
	});
	res.status(200).json({
		success: true,
		message: 'Logged out successfully',
	});
});

//Admin Routes

// Get all users = >/api/v1/admin/users

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		success: true,
		count: users.length,
		users,
	});
});

// Get User deatils specifically  = >/api/v1/admin/user/:id

exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ _id: req.params.id });

	if (!user) {
		return next(
			new ErrorHandler(`User not found with id ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		user,
	});
});

//Update user Profile => /api/v1/admin/user/:id

exports.updateUser = catchAsync(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	};

	const user = await User.findOneAndUpdate(
		{ _id: req.params.id },
		newUserData,
		{ new: true, runValidators: true }
	);
	res.status(200).json({
		success: true,
	});
});

// delete User deatils specifically  = >/api/v1/admin/user/:id

exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ _id: req.params.id });

	if (!user) {
		return next(
			new ErrorHandler(`User not found with id ${req.params.id}`, 404)
		);
	}

	//Remove avatar from cloudinary server - TODO

	await user.remove();

	res.status(200).json({
		success: true,
	});
});
