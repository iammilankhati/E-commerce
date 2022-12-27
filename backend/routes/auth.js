const express = require('express');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const {
	registerUser,
	loginUser,
	logoutUser,
	forgotPassword,
	resetPassword,
	getUserProfile,
	updatePassword,
	updateProfile,
	getAllUsers,
	getUser,
	updateUser,
	deleteUser,
} = require('../controllers/authController');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').get(logoutUser);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/password/me/update').put(isAuthenticatedUser, updateProfile);

router
	.route('/admin/users')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router
	.route('/admin/user/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getUser);
router
	.route('/admin/user/:id')
	.put(isAuthenticatedUser, authorizeRoles('admin'), updateUser);
router
	.route('/admin/user/:id')
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;
