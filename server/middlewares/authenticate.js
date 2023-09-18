const ErrorHandler = require("../utis/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuntenticatedUser = catchAsyncError(async (req,res,next) =>{
    const {token} = req.cookies;   //we get token from cookies token can expire after some time so we do if statement

    if(!token){
        return next(new ErrorHandler("Login first to handle this resource" , 401))
    }

    const decoded =  jwt.verify(token , process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);                    // oru token kana user data va user nu onu create panni athula vachirukku
  next();

})

exports.authorizeRoles = (...roles) =>{
 return (req,res,next) =>{
        if(!roles.includes(req.user.role)){            //we can access user proerty in req object  
            console.log(`User role is ${req.user.role}`)        
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed` ,401));
            
        }
        next()
    }
}