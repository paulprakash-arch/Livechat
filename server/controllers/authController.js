const catchAsyncError = require('../middlewares/catchAsyncError')
const User = require('../models/userModel');
const sendEmail = require('../utis/email');
const ErrorHandler = require('../utis/errorHandler');
const sendToken = require('../utis/jwt');
const crypto = require('crypto');
//Register User api -/api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
console.log("register request got from backend");


  let avatar;

  let BASE_URL = process.env.BACKEND_URL;
if(process.env.NODE_ENV ==='production'){
  BASE_URL = `${req.protocol}://${req.get('host')}`
}
console.log("2")
  if(req.file){
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
  }
  console.log("3")

  const user = await User.create({
    name,
    email,
    password,
    avatar
  });
  console.log("registered")
  sendToken(user, 201, res);

})
//Login User api- api/v1/auth/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  console.log('Login request received:', email); // Add this line

  if (!email || !password) {
    console.log('Invalid request: Missing email or password'); // Add this line
    return next(new ErrorHandler('Please enter email and password', 400));
  }

  // Finding the user from the database
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', user); // Add this line
  
  // if (!user) {
  //   console.log('Invalid email or password'); // Add this line
  //   return next(new ErrorHandler('Invalid email or Password', 401));
  // }
  
  if (!await user.isValidPassword(password)) {
    console.log('Invalid password for user:', user.email); // Add this line
    return next(new ErrorHandler('Invalid email or Password', 401));
  }
  
  console.log('Login successful for user:', user.email); // Add this line
  
  sendToken(user, 201, res);
});

//Logout API - api/v1/auth/logout
exports.logoutUser = (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),                   //we need only to delete the cookie to logout
    httpOnly: true
  }).status(200)
    .json({
      succes: true,
      message: "Logged Out"
    })
}
//Forget password - api/v1/auth/password/forgot
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler('User not found with this email', 401))
  }

  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false })

  let BASE_URL = process.env.FRONTEND_URL;
if(process.env.NODE_ENV ==='production'){
  BASE_URL = `${req.protocol}://${req.get('host')}`
}

  //Create reset url 
  const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

  const message = `Your password reset link is as follow \n\n
  ${resetUrl}\n\n If you have not requested this email, then ignore it`

  try {
    sendEmail({
      email: user.email,
      subject: "Igris Password Recovery",
      message
    })

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email}`
    })

  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message), 500)
  }
})
//Reset Password - api/v1/auth/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: {
      $gt: Date.now()
    }
  })

  if (!user) {
    return next(new ErrorHandler("Password reset Token is inValid or expired", 404))
  }
  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesnot match", 404))
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save({validateBeforeSave:false})

  sendToken(user,201,res)
})

//Get user profile
exports.getUserProfile = catchAsyncError(async (req,res,next) =>{
 const user =await User.findById(req.user.id);          //req.user is in authenticate.js oru flow va varuthu anga irunthu inga
 res.status(200).json({
  success:true,
  user
 })                               
})

//Change PAssword - api/v1/password/change
exports.changePassword = catchAsyncError(async (req,res,next) =>{
  const user =await User.findById(req.user.id).select('+password');
  console.log("User:" , user);
  //check old password
  if(!await user.isValidPassword(req.body.oldPassword)){
    console.log("OldPassword is:" , req.body.oldPassword);
    return next(new ErrorHandler("Old password is incorrect" , 401));
  }
  //assingning new password
  console.log("Password correct");
  user.password = req.body.password;
  console.log("Password correct");

  await user.save();
  res.status(200).json({
    success:true,
   }) 
})
//Update profile - /api/v1/update
exports.updateProfile = catchAsyncError(async(req,res,next) =>{
  let newUserData = {
    name:req.body.name,
    email:req.body.email
  }

  let avatar;
  let BASE_URL = process.env.BACKEND_URL;
if(process.env.NODE_ENV ==='production'){
  BASE_URL = `${req.protocol}://${req.get('host')}`
}
  if(req.file){
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    newUserData ={...newUserData,avatar}
  }
 const user = await User.findByIdAndUpdate(req.user.id , newUserData,{
    new:true,
    runValidators:true,
  })

  res.status(200).json({
    success:true,
    user
  })
})

//Admin get all users
exports.getAllUsers = catchAsyncError(async(req,res,next) =>{
  const users = await User.find();
  res.status(200).json({
    success:true,
    users
  })
})

//Admin get specific user
exports.getUser = catchAsyncError(async(req,res,next) =>{
  const user = await User.findById(req.params.id);
  if(!user){
    return next(new ErrorHandler(`There is no such user with this ${req.params.id}` , 401));
  }
  res.status(200).json({
    success:true,
    user
  })
});

//Admin Update user
exports.updateUser =  catchAsyncError(async(req,res,next) =>{
  const newUserData = {
    name:req.body.name,
    email:req.body.email,
    role:req.body.role
  }
 const user = await User.findByIdAndUpdate(req.params.id , newUserData,{
    new:true,
    runValidators:true,
  })

  res.status(200).json({
    success:true,
    user
  })
})

//Admin deleteuser
exports.deleteUser =catchAsyncError(async(req,res,next) =>{
  const user = await User.findById(req.params.id);
  if(!user){
    return next(new ErrorHandler(`There is no such user with this ${req.params.id}` , 401));
  }
  await user.deleteOne();
  res.status(200).json({
    success:true,
    message: "User is deleted"
  })
})