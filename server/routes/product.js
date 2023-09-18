const express = require("express");
const multer = require('multer');
const path = require('path');

const { getProducts, newProduct, getsingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview, getAdminProducts } = require("../controllers/productController");
const router = express.Router();
const {isAuntenticatedUser, authorizeRoles} = require('../middlewares/authenticate')

const upload = multer({storage:multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, path.join( __dirname ,'..',`uploads/product`))
    },                                                                //this whole multer return some object and we store the object in uploads         
    filename: function(req,file,cb){
        cb(null , file.originalname)
    }
})})

router.route('/products' ).get(getProducts);   //if we call route product we can get the function getProducts.
router.route('/product/:id').get(getsingleProduct);
// router.route('/product/:id').put(updateProduct);
// router.route('/product/:id').delete(deleteProduct);
router.route('/review').put(isAuntenticatedUser, createReview);
router.route('/reviews').get(isAuntenticatedUser, getReviews);
router.route('/reviews').delete(isAuntenticatedUser, deleteReview);

//Admin routes
router.route('/admin/product/new').post(isAuntenticatedUser, authorizeRoles('admin'),upload.array('images'),newProduct);   //here newProduct is a handler.    first he needs to be login then check the user if he is just user or admin and create product
router.route('/admin/products').get(isAuntenticatedUser, authorizeRoles('admin'),getAdminProducts);   //here newProduct is a handler.    first he needs to be login then check the user if he is just user or admin and create product
router.route('/admin/product/:id').delete(isAuntenticatedUser, authorizeRoles('admin'),deleteProduct);   //here newProduct is a handler.    first he needs to be login then check the user if he is just user or admin and create product
router.route('/admin/product/:id').put(isAuntenticatedUser, authorizeRoles('admin'),upload.array('images'), updateProduct);
router.route('/admin/reviews').get(isAuntenticatedUser, authorizeRoles('admin'),getReviews)
router.route('/admin/review').delete(isAuntenticatedUser, authorizeRoles('admin'),deleteReview)
module.exports = router;