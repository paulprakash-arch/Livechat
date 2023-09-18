const express = require('express');
const { newOrder, getSingleOrder, myOrders, orders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuntenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/order/new').post(isAuntenticatedUser, newOrder);
router.route('/order/:id').get(isAuntenticatedUser, getSingleOrder);
router.route('/myorders').get(isAuntenticatedUser, myOrders);

//admin routes
router.route('/admin/orders').get(isAuntenticatedUser, authorizeRoles('admin') ,orders);
router.route('/admin/order/:id').put(isAuntenticatedUser, authorizeRoles('admin') ,updateOrder);
router.route('/admin/order/:id').delete(isAuntenticatedUser, authorizeRoles('admin') ,deleteOrder);

module.exports =router;