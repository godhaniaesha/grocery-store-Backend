const express = require("express");
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById, createAdminUser, setGstNumber, createBrandDetails, setBankDetails, pickUpAddress, userDasboard, resendRegisterOtp, verifyAndSubmit } = require("../controller/userController");
const { createContactUs, getAllContactUs, getContactUsById, updateContactUsById, deleteContactUsById } = require("../controller/contactUsController");
const { createFaq, getAllFaqs, getFaqById, updateFaqById, deleteFaqById } = require("../controller/FaqController");
const { createTerms, getAllTerms, getTermsById, updateTermsById, deleteTermsAndById } = require("../controller/TermsAndConditionController");
const { userLogin, emailOtpVerify, forgotPassword, resetPassword, changePassword, userGoggleLogin, resendOtp, userLogout } = require("../auth/auth");
const { createAddress, getAllAddress, getAddressById, updateAddressById, deleteAddressById, getAllMyAddress } = require("../controller/addressController");
const { createCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById, checkemail } = require("../controller/categoryController");
const { createReason, getAllReasons, getReasonById, updateReasonById, deleteReasonById } = require("../controller/reasonforCancellationController");
const { createProduct, getAllProducts, getProductById, updateProductById, updatePackSizeById, deletePackSizeById, deleteProductById, getProductByCategory } = require("../controller/productController");
const { createProductVarient, getAllProductVarient, getProductVarientById, updateProductVarientById, deleteProductVarientById, getOwnProductVar } = require("../controller/productVarientController");
const { createCart, getAllCarts, getCartsById, updateCartsById, deleteCartById, getAllMyCarts } = require("../controller/cartController");
const { createCoupen, getAllCoupens, getCoupenById, updateCoupenById, deleteCoupenById, getAllExpireCoupen } = require("../controller/coupenController");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, updateOrderStatusById, deleteOrderById, getAllMyOrders } = require("../controller/orderController");
const { createCancelOrder, getAllCancelOrder, getCancelOrderById } = require("../controller/cancelOrderController");
const { createStock, getAllStocks, getStockById, updateStockById, deleteStockById } = require("../controller/stockController");
const { createRejectOrder, getAllRejectOrders, getRejectOrderById } = require("../controller/rejectOrderController");
const { createPayment, getAllPayments, getPaymentById } = require("../controller/paymentController");
const { getDashboardSummary, getSalesByCategory, getRevenueStatistics, getRecentOrders, getAllProductOfSeller, getMonthlyRevenue } = require("../controller/dashboardController");
const { GetPaymentSummary, GetPaymentDistribution, getPaymentComparison, getTransactionDetails, getalldatabyseller } = require("../controller/paymentDashBoardController");
const upload = require("../helper/imageUplode");
const { auth } = require("../helper/authToken");
const indexRoutes = express.Router();

// auth Routes

indexRoutes.post('/userLogin', userLogin)
indexRoutes.post('/userGoggleLogin', userGoggleLogin)
indexRoutes.post('/emailOtpVerify', emailOtpVerify)
indexRoutes.post('/resendEmailOtp', resendOtp)
indexRoutes.post('/forgotPassword', forgotPassword)
indexRoutes.put('/resetPassword', resetPassword)
indexRoutes.get('/userDasboard', userDasboard)
indexRoutes.post('/userLogout', auth(['admin', 'user']), userLogout)

// Admin Dashboard

indexRoutes.get('/getDashboardSummary', auth(['admin']), getDashboardSummary)
indexRoutes.get('/salesByCategory', auth(['admin']), getSalesByCategory)
indexRoutes.get('/revenueStatistics', auth(['admin']), getRevenueStatistics)
indexRoutes.get('/recentOrders', auth(['admin']), getRecentOrders)

indexRoutes.get("/getSalesByCategory/:sellerID", auth(["admin"]), getSalesByCategory);
indexRoutes.get("/getAllProductOfSeller/:sellerID", auth(["admin"]), getAllProductOfSeller);
indexRoutes.get("/getMonthlyRevenue/:sellerID", auth(["admin"]), getMonthlyRevenue);

// Payment Dashboard

indexRoutes.get('/paymentSummary', auth(['admin']), GetPaymentSummary)
indexRoutes.get('/paymentDistribution', auth(['admin']), GetPaymentDistribution)
indexRoutes.get('/getPaymentComparison', auth(['admin']), getPaymentComparison)
indexRoutes.get('/transactionDetails', auth(['admin']), getTransactionDetails)
indexRoutes.get("/getalldatabyseller/:sellerID", auth(["admin"]), getalldatabyseller);

// Admin Details Routes

indexRoutes.put('/changePassword', auth(['admin', 'user']), changePassword)
indexRoutes.put('/setGstNumber', auth(['admin']), setGstNumber)
indexRoutes.put('/setBrandDetails', auth(['admin']), createBrandDetails)
indexRoutes.put('/setBankDetails', auth(['admin']), setBankDetails)
indexRoutes.put('/setPickUpAddress', auth(['admin']), pickUpAddress)
indexRoutes.put('/verifyAndSubmit', auth(['admin']), verifyAndSubmit)

// user routes 

indexRoutes.post('/createAdmin', createAdminUser)
indexRoutes.post("/createUser", createUser);
indexRoutes.post('/resendRegisterOtp', resendRegisterOtp)
indexRoutes.get('/allUsers', auth(['admin']), getAllUsers)
indexRoutes.get('/getUser', auth(['admin', 'user']), getUserById)
indexRoutes.put('/updateUser', auth(['admin', 'user']), upload.single('image'), updateUserById)
indexRoutes.delete('/deleteUser', auth(['admin', 'user']), deleteUserById)

// category Routes

indexRoutes.post('/createCategory', auth(['admin']), upload.single('categoryImage'), createCategory)
indexRoutes.get('/allCategory', getAllCategory)
indexRoutes.get('/getCategory/:id', auth(['admin', 'user']), getCategoryById)
indexRoutes.put('/updateCategory/:id', auth(['admin']), upload.single('categoryImage'), updateCategoryById)
indexRoutes.delete('/deleteCategory/:id', auth(['admin']), deleteCategoryById)

// address Routes

indexRoutes.post('/createAddress', auth(['user', 'admin']), createAddress)
indexRoutes.get('/allAddress', auth(['admin']), getAllAddress)
indexRoutes.get('/getAddress/:id', auth(['admin', 'user']), getAddressById)
indexRoutes.put('/updateAddress/:id', auth(['admin', 'user']), updateAddressById)
indexRoutes.delete('/deleteAddress/:id', auth(['admin', 'user']), deleteAddressById)
indexRoutes.get('/allMyAddress', auth(['admin', 'user']), getAllMyAddress)

// product Routes

indexRoutes.post('/createProduct', auth(['admin', 'user']), upload.fields([{ name: 'images' }]), createProduct)
indexRoutes.get('/allProducts', getAllProducts)
indexRoutes.get('/getProduct/:id', auth(['admin', 'user']), getProductById)
indexRoutes.put('/updateProduct/:id', auth(['admin', 'user']), upload.fields([{ name: 'images' }]), updateProductById)
indexRoutes.delete('/deleteProduct/:id', auth(['admin']), deleteProductById)
indexRoutes.get('/getProductByCategory/:id', getProductByCategory)

// Product Varient Routes

indexRoutes.post('/createProductVarient', auth(['admin']), createProductVarient)
indexRoutes.get('/allProductVarient', getAllProductVarient)
indexRoutes.get('/getProductVarient/:id', auth(['admin', 'user']), getProductVarientById)
indexRoutes.put('/updateProductVarient/:id', auth(['admin']), updateProductVarientById)
indexRoutes.delete('/deleteProductVarient/:id', auth(['admin']), deleteProductVarientById)
indexRoutes.get('/getOwnProductVar', auth(['admin', 'user']), getOwnProductVar)

// Card Routes

indexRoutes.post('/createCart', auth(['admin', 'user']), createCart)
indexRoutes.get('/allCarts', auth(['admin', 'user']), getAllCarts)
indexRoutes.get('/getCart/:id', auth(['admin', 'user']), getCartsById)
indexRoutes.put('/updateCart/:id', auth(['admin', 'user']), updateCartsById)
indexRoutes.delete('/deleteCart/:id', auth(['admin', 'user']), deleteCartById)
indexRoutes.get('/allMyCarts', auth(['admin', 'user']), getAllMyCarts)

// Coupen Routes

indexRoutes.post('/createCoupen', auth(['admin']), createCoupen)
indexRoutes.get('/allCoupens', auth(['admin', 'user']), getAllCoupens)
indexRoutes.get('/getCoupen/:id', auth(['admin', 'user']), getCoupenById)
indexRoutes.put('/updateCoupen/:id', auth(['admin']), updateCoupenById)
indexRoutes.delete('/deleteCoupen/:id', auth(['admin']), deleteCoupenById)

// Order Routes

indexRoutes.post('/createOrder', auth(['admin', 'user']), createOrder)
indexRoutes.get('/allOrders', auth(['admin']), getAllOrders)
indexRoutes.get('/getOrder/:id', auth(['admin', 'user']), getOrderById)
indexRoutes.put('/updateOrderStatus/:id', auth(['admin', 'user']), updateOrderStatusById)
indexRoutes.delete('/deleteOrder/:id', auth(['admin']), deleteOrderById)
indexRoutes.get('/allMyOrders', auth(['admin', 'user']), getAllMyOrders)

// Cancel Order Roues

indexRoutes.post('/cancelOrder', auth(['user']), createCancelOrder)
indexRoutes.get('/allCancelOrder', auth(['user']), getAllCancelOrder)
indexRoutes.get('/getCancelOrder/:id', auth(['user']), getCancelOrderById)

// Stock Routes

indexRoutes.post('/createStock', auth(['admin']), createStock)
indexRoutes.get('/allStocks', auth(['admin']), getAllStocks)
indexRoutes.get('/getStock/:id', auth(['admin']), getStockById)
indexRoutes.put('/updateStock/:id', auth(['admin']), updateStockById)
indexRoutes.delete('/deleteStock/:id', auth(['admin']), deleteStockById)

// Reject Order 

indexRoutes.post('/rejectOrder', auth(['admin']), createRejectOrder)
indexRoutes.get('/allRejectedOrders', auth(['admin']), getAllRejectOrders)
indexRoutes.get('/getRejectOrder/:id', auth(['admin']), getRejectOrderById)

// Payment Routes

indexRoutes.post('/createPayment', auth(['admin', 'user']), createPayment);
indexRoutes.get('/allPayments', auth(['admin', 'user']), getAllPayments)
indexRoutes.get('/getPayment/:id', auth(['admin', 'user']), getPaymentById)

// contactus routes

indexRoutes.post('/createContactUs', createContactUs)
indexRoutes.get('/allContactUs', auth(['admin']), getAllContactUs)
indexRoutes.get('/getContactUs/:id', auth(['admin']), getContactUsById)
indexRoutes.delete('/deleteContactUs/:id', auth(['admin']), deleteContactUsById)

// FAQ Routes

indexRoutes.post('/createFaq', auth(['admin']), createFaq);
indexRoutes.get('/allFaqs', auth(['admin', 'user']), getAllFaqs)
indexRoutes.get('/getFaq/:id', auth(['admin', 'user']), getFaqById)
indexRoutes.put('/updateFaq/:id', auth(['admin']), updateFaqById)
indexRoutes.delete('/deleteFaq/:id', auth(['admin']), deleteFaqById)

// Terms & Condition Routes

indexRoutes.post('/createTerm', auth(['admin']), createTerms)
indexRoutes.get('/allTerms', auth(['admin', 'user']), getAllTerms)
indexRoutes.get('/getTerms/:id', auth(['admin', 'user']), getTermsById)
indexRoutes.put('/updateTerms/:id', auth(['admin']), updateTermsById)
indexRoutes.delete('/deleteTerms/:id', auth(['admin']), deleteTermsAndById)

// Reason For Cancellation Routes

indexRoutes.post('/createReason', auth(['admin']), createReason)
indexRoutes.get('/allReasons', auth(['admin', 'user']), getAllReasons)
indexRoutes.get('/getReason/:id', auth(['admin', 'user']), getReasonById)
indexRoutes.put('/updateReason/:id', auth(['admin']), updateReasonById)
indexRoutes.delete('/deleteReason/:id', auth(['admin']), deleteReasonById)

module.exports = indexRoutes;