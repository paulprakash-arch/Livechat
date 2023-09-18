const express = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({storage:multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, path.join( __dirname ,'..',`uploads/user`))
    },                                                                //this whole multer return some object and we store the object in uploads         
    filename: function(req,file,cb){
        cb(null , file.originalname)
    }
})})
const { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, getUserProfile, changePassword, updateProfile, getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/authController');
const { isAuntenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/login').post(loginUser); // Use '/login' route for login
router.route('/logout').get(logoutUser); 
router.route('/register').post(registerUser); 
router.route('/password/forgot').post(forgetPassword); 
router.route('/password/reset/:token').post(resetPassword); 
router.route('/myprofile').get(isAuntenticatedUser , getUserProfile); 
router.route('/update').put(isAuntenticatedUser ,upload.single('avatar'), updateProfile); 
router.route('/password/change').put(isAuntenticatedUser , changePassword); 


//Admin routes
router.route('/admin/users').get(isAuntenticatedUser , authorizeRoles('admin'), getAllUsers); 
router.route('/admin/user/:id').get(isAuntenticatedUser , authorizeRoles('admin'), getUser); 
router.route('/admin/user/:id').put(isAuntenticatedUser , authorizeRoles('admin'), updateUser); 
router.route('/admin/user/:id').delete(isAuntenticatedUser , authorizeRoles('admin'), deleteUser); 

module.exports = router;