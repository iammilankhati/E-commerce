//error handler class
class ErrorHandler extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;

		//take snapshot of functions calls stack and helps to debug errors
		Error.captureStackTrace(this, this.constuctor);
	}
}

module.exports = ErrorHandler;
