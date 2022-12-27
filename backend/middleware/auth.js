const User = require('../models/user');

const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');

//check if user is authenticated or
module.exports.isAuthenticatedUser = catchAsyncErrors(
	async (req, res, next) => {
		const { token } = req.cookies;
		if (token === 'j:null') {
			return next(new ErrorHandler('Login First to Access this resouce.', 401));
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.find({ _id: decoded.id });
		next();
	}
);

//Handling user roles
module.exports.authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user[0].role)) {
			return next(
				new ErrorHandler(
					`Role (${req.user[0].role}) is not allowed to access this resouces`,
					403
				)
			);
		}
		next();
	};
};
