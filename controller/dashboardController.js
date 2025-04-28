const categoryModels = require('../models/categoryModels');
const Order = require('../models/orderModels');
const paymentmodels = require('../models/paymentmodels');
const productModels = require('../models/productModels');
const Product = require('../models/productModels');
const productVarientModels = require('../models/productVarientModels');
const mongoose = require("mongoose");

// const fillMissingDates = (revenueData, startDate, endDate, timeframe) => {
//     const filledData = [];
//     const dateMap = {};

//     revenueData.forEach(item => {
//         dateMap[item.date] = item;
//     });

//     let currentDate = new Date(startDate);

//     while (currentDate <= endDate) {
//         let dateKey;

//         if (timeframe === 'year') {
//             const year = currentDate.getFullYear();
//             const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//             const monthStr = String(month + 1).padStart(2, '0');
//             dateKey = `${year}-${monthStr}-${month}`;

//             currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
//         } else {
//             const year = currentDate.getFullYear();
//             const month = String(currentDate.getMonth() + 1).padStart(2, '0');
//             const day = String(currentDate.getDate()).padStart(2, '0');
//             dateKey = `${year}-${month}-${day}`;

//             currentDate = new Date(currentDate);
//             currentDate.setDate(currentDate.getDate() + 1);
//         }

//         if (dateMap[dateKey]) {
//             filledData.push(dateMap[dateKey]);
//         } else {
//             filledData.push({
//                 date: dateKey,
//                 revenue: 0,
//                 count: 0
//             });
//         }
//     }

//     return filledData;
// };

const fillMissingDates = (revenueData, startDate, endDate, timeframe) => {
    const filledData = [];
    const dateMap = {};

    const monthNames = [
        "Jan", "Feb", "March", "Apr", "May", "June",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    revenueData.forEach(item => {
        dateMap[item.date] = item;
    });

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let dateKey;

        if (timeframe === 'year') {
            const year = currentDate.getFullYear();
            const monthIndex = currentDate.getMonth(); // 0-based
            const monthNum = String(monthIndex + 1).padStart(2, '0');
            const formattedDate = `${year}-${monthNum}`;

            const existing = dateMap[formattedDate];

            dateKey = monthNames[monthIndex];

            filledData.push({
                date: dateKey,
                revenue: existing?.revenue || 0,
                count: existing?.count || 0
            });

            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            dateKey = `${year}-${month}-${day}`;

            if (dateMap[dateKey]) {
                filledData.push(dateMap[dateKey]);
            } else {
                filledData.push({
                    date: dateKey,
                    revenue: 0,
                    count: 0
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return filledData;
};

function calculateGrowthPercentage(currentValue, previousValue) {
    if (previousValue === 0) return 100;
    return ((currentValue - previousValue) / previousValue) * 100;
}

exports.getDashboardSummary = async (req, res) => {
    try {
        const currentDate = new Date();
        const previousPeriodDate = new Date();
        previousPeriodDate.setMonth(currentDate.getMonth() - 1);

        const [totalOrders, totalProducts, cancelOrder, deliveredOrders] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments({ orderStatus: 'Cancelled' }),
            Order.countDocuments({ orderStatus: 'Delivered' })
        ]);

        const previousPeriodOrders = await Order.aggregate([
            { $match: { createdAt: { $lt: previousPeriodDate } } },
            { $count: "count" }
        ]);

        const previousPeriodCancelledOrders = await Order.aggregate([
            { $match: { orderStatus: 'Cancelled', createdAt: { $lt: previousPeriodDate } } },
            { $count: "count" }
        ]);

        const previousPeriodDeliveredOrders = await Order.aggregate([
            { $match: { orderStatus: 'Delivered', createdAt: { $lt: previousPeriodDate } } },
            { $count: "count" }
        ]);

        const previousPeriodProducts = await Product.aggregate([
            { $match: { createdAt: { $lt: previousPeriodDate } } },
            { $count: "count" }
        ]);

        const ordersGrowth = calculateGrowthPercentage(
            totalOrders,
            previousPeriodOrders[0]?.count || 0
        );

        const productsGrowth = calculateGrowthPercentage(
            totalProducts,
            previousPeriodProducts[0]?.count || 0
        );

        const cancelOrderGrowth = calculateGrowthPercentage(
            cancelOrder,
            previousPeriodCancelledOrders[0]?.count || 0
        );

        const deliveredOrdersGrowth = calculateGrowthPercentage(
            deliveredOrders,
            previousPeriodDeliveredOrders[0]?.count || 0
        );

        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                totalOrders,
                totalProducts,
                cancelOrder,
                deliveredOrders,
                growth: {
                    orders: ordersGrowth.toFixed(1),
                    products: productsGrowth.toFixed(1),
                    cancelOrder: cancelOrderGrowth.toFixed(1),
                    deliveredOrders: deliveredOrdersGrowth.toFixed(1)
                }
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.getSalesByCategory = async (req, res) => {
    try {
        let getSalesData = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            { $unwind: '$productData' },
            {
                $lookup: {
                    from: 'productvarients',
                    localField: "items.productVarientId",
                    foreignField: "_id",
                    as: "productVarientData"
                }
            },
            { $unwind: '$productVarientData' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productData.categoryId',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            { $unwind: '$categoryData' },
            {
                $group: {
                    _id: '$categoryData._id',
                    categoryName: { $first: '$categoryData.categoryName' },
                    totalSales: { $sum: '$items.quantity' },
                    totalAmount: { $sum: { $multiply: ['$items.quantity', '$productVarientData.price'] } }
                }
            },
            {
                $project: {
                    categoryName: 1,
                    totalSales: 1,
                    totalAmount: 1
                }
            }
        ])

        const totalSales = getSalesData.reduce((sum, item) => sum + item.totalSales, 0);

        const categoriesWithPercentage = getSalesData.map(item => ({
            ...item,
            percentage: parseFloat(((item.totalSales / totalSales) * 100).toFixed(2))
        }));

        return res.status(200).json({
            status: 200,
            success: true,
            data: categoriesWithPercentage
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

const getDateRange = (timeframe, year, month) => {
    const now = new Date();
    let startDate, endDate;

    switch (timeframe) {
        case 'day':
            const day = parseInt(month) || now.getDate();
            startDate = new Date(year, 0, day);
            endDate = new Date(year, 0, day);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'month':
            startDate = new Date(year, month - 1, 1);

            endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'year':
            startDate = new Date(year, 0, 1);

            endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;

        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
};

exports.getRevenueStatistics = async (req, res) => {
    try {
        const { timeframe = 'year', year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

        const { startDate, endDate } = getDateRange(timeframe, parseInt(year), parseInt(month));

        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] }
                }
            },
            {
                $addFields: {
                    dateStr: {
                        $dateToString: {
                            format: timeframe === 'year' ? '%Y-%m' : '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    revenue: { $round: ["$revenue", 2] },
                    count: 1
                }
            }
        ]);

        if (!revenueData || revenueData.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No revenue data found for the selected date range.',
                data: {
                    revenueData: [],
                    totalRevenue: 0,
                    orderCount: 0,
                }
            });
        }

        const filledRevenueData = fillMissingDates(revenueData, startDate, endDate, timeframe);
        console.log(filledRevenueData);

        const totalRevenue = filledRevenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const orderCount = filledRevenueData.reduce((sum, item) => sum + (item.count || 0), 0);

        return res.status(200).json({
            status: 200,
            message: "Revenue statistics retrieved successfully.",
            data: {
                revenueData: filledRevenueData,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Order.aggregate([
            { $sort: { createdAt: -1 } },

            { $limit: 10 },

            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    customerName: {
                        $concat: [
                            { $ifNull: ['$user.firstName', ''] },
                            ' ',
                            { $ifNull: ['$user.lastName', ''] }
                        ]
                    },
                    payment: {
                        $cond: [
                            { $eq: ['$payment.paymentMethod', 'Cod'] },
                            'COD',
                            {
                                $cond: [
                                    { $eq: ['$payment.paymentMethod', 'Card'] },
                                    {
                                        $cond: [
                                            { $eq: ['$paymentStatus', 'Received'] },
                                            'Credit Card',
                                            'Debit Card'
                                        ]
                                    },
                                    {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ['$payment', null] },
                                                    { $eq: ['$payment.paymentStatus', 'Success'] }
                                                ]
                                            },
                                            'Paid',
                                            'Unknown'
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    amount: { $toString: "$totalAmount" },
                    orderStatus: '$orderStatus',
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const formattedOrders = recentOrders.map(order => ({
            ...order,
            amount: order.amount
        }));

        return res.status(200).json({ status: 200, data: formattedOrders });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.messageF });
    }
};


exports.getAllProductOfSeller = async (req, res) => {
    try {
        const sellerID = new mongoose.Types.ObjectId(req.params.sellerID);

        // Step 1: Find all variants where sellerId matches
        const varients = await productVarientModels.find({ sellerId: sellerID });

        const totalVarients = varients.length;

        // Step 2: Get unique productIds from those varients
        const uniqueProductIds = [
            ...new Set(varients.map(variant => variant.productId.toString()))
        ];

        // Step 3: Count unique products based on productIds
        const totalProducts = await productModels.countDocuments({
            _id: { $in: uniqueProductIds.map(id => new mongoose.Types.ObjectId(id)) }
        });

        return res.status(200).json({
            status: 200,
            totalVarients,
            totalProducts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};
 



exports.getSalesByCategory = async (req, res) => {
    try {
        const sellerID = new mongoose.Types.ObjectId(req.params.sellerID);

        // Step 1: Get all categories
        const allCategories = await categoryModels.find({}, { _id: 1, categoryName: 1 });

        // Step 2: Get seller-wise sales per category
        const result = await paymentmodels.aggregate([
            { $match: { paymentStatus: "Success" } },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "order"
                }
            },
            { $unwind: "$order" },
            { $unwind: "$order.items" },
            {
                $lookup: {
                    from: "productvarients",
                    localField: "order.items.productVarientId",
                    foreignField: "_id",
                    as: "varient"
                }
            },
            { $unwind: "$varient" },
            {
                $match: {
                    "varient.sellerId": sellerID
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "varient.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $addFields: {
                    totalPrice: {
                        $multiply: ["$order.items.quantity", "$varient.price"]
                    }
                }
            },
            {
                $group: {
                    _id: "$product.categoryId",
                    totalSales: { $sum: "$totalPrice" }
                }
            }
        ]);

        // Step 3: Merge with all categories
        const salesMap = {};
        result.forEach(item => {
            salesMap[item._id.toString()] = item.totalSales;
        });

        const mergedResults = allCategories.map(category => {
            const categoryId = category._id.toString();
            const totalSales = salesMap[categoryId] || 0;
            return {
                categoryId: category._id,
                categoryName: category.categoryName, // Set categoryName here
                totalSales
            };
        });

        // Step 4: Calculate grand total and percentages
        const grandTotal = mergedResults.reduce((acc, cur) => acc + cur.totalSales, 0);

        const finalOutput = mergedResults.map(item => ({
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            totalSales: item.totalSales,
            percentage: grandTotal > 0 ? ((item.totalSales / grandTotal) * 100).toFixed(2) : "0.00"
        }));

        return res.status(200).json({
            status: 200,
            data: finalOutput
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const result = await paymentmodels.aggregate([
            {
                $match: {
                    paymentStatus: "Success"
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "orderData"
                }
            },
            { $unwind: "$orderData" },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$orderData.totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    totalRevenue: { $round: ["$totalRevenue", 2] }
                }
            },
            {
                $sort: {
                    year: 1,
                    month: 1
                }
            }
        ]);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const groupedByYear = {};

        if (result.length === 0) {
            return res.status(200).json({
                status: 200,
                data: {}
            });
        }

        // Build the response with month names
        result.forEach(({ year, month, totalRevenue }) => {
            if (!groupedByYear[year]) {
                groupedByYear[year] = monthNames.map((name, index) => ({
                    month: name,
                    revenue: 0
                }));
            }
            groupedByYear[year][month - 1].revenue = totalRevenue;
        });

        return res.status(200).json({
            status: 200,
            data: groupedByYear
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

