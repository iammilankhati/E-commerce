const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const {
	newProduct,
	getProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	deleteReview,
	createProductReview,
	getProductReviews,
} = require('../controllers/productController');

router.route('/products').get(isAuthenticatedUser, getProducts);
router.route('/products/:id').get(getSingleProduct);
router
	.route('/admin/product/new')
	.post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router
	.route('/admin/products/:id')
	.patch(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router
	.route('/admin/products/:id')
	.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);

router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

module.exports = router;
