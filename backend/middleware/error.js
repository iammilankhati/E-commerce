const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.message = err.message || 'Internal Server Error';

	if (process.env.NODE_ENV.trim() === 'DEVELOPMENT') {
		res.status(err.statusCode).json({
			success: false,
			error: err,
			errMessage: err.message,
			stack: err.stack,
		});
	}

	if (process.env.NODE_ENV.trim() === 'PRODUCTION') {
		let error = { ...err };
		error.message = err.message;

		//wrong mongoose id error
		if (err.name == 'CastError') {
			const message = `Resources not found. Invalid: ${err.path}`;
			error = new ErrorHandler(message, 400);
		}
		//	Handling mongoose validation error
		if (err.name === 'ValidatiorError') {
			const message = Object.values(err.values).map((value) => value.message);
			error = new ErrorHandler(message, 400);
		}
		//handling the mongoose duplicate key error
		if (err.code === 11000) {
			const message = `Duplicate ${Object.keys(err.keyValue)} entered `;
			error = new ErrorHandler(message, 400);
		}
		//Handling wrong jwt error
		if (err.name === 'JsonWebTokenError') {
			const message = `JSON Web Token is invalid, Try again`;
			error = new ErrorHandler(message, 400);
		}

		//Handling Expired JWT error
		if (err.name === 'TokenExpiredError') {
			const message = `JSON Web Token is expired, Try again`;
			error = new ErrorHandler(message, 400);
		}

		res.status(error.statusCode).json({
			success: false,
			message: error.message || 'Internal Server Error',
		});
	}
};
