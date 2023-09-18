const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter name'],
    },
    email:{
        type:String,
        required: [true, 'Please enter email'],
        unique:true,
        validate:[validator.isEmail , 'Please enter valid email'],
    },
    password:{
        type:String,
        required:[true, "Please enter password"],
        maxlength:[8, "Password cannot exceed 8 characters"],
        select:false
    },
    avatar:{
        type:String,
        
    },
    role:{
        type:String,
        default:'user'
    },
    resetPasswordToken:String,
    resetPasswordTokenExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
})
userSchema.pre('save' , async function(next){ 
         //if this middleware didnt have to work sometimes like when just get the respons so we need to use 'next'  
   if (!this.isModified('password')){
    next();
   }
    this.password = await bcrypt.hash(this.password ,10);
})

userSchema.methods.getJwtToken = function(){
   return jwt.sign({id:this.id} , process.env.JWT_SECRET , {
        expiresIn:process.env.JWT_EXPIRES_TIME                              //sign(payload,secretkey,options)
    })
}

userSchema.methods.isValidPassword = async function(enteredpassword){
  return  bcrypt.compare(enteredpassword, this.password)
}

userSchema.methods.getResetToken = function() {
    //Generate Token
  const token = crypto.randomBytes(20).toString('hex');

  //Generate Hash and set to resetPasswordToken
 this.resetPasswordToken =  crypto.createHash('sha256').update(token).digest('hex');

 //Set token expire time
 this.resetPasswordTokenExpire = Date.now() + 30*60*1000;    //expire after 30 mins
return token;
}
let model = mongoose.model('User', userSchema);
module.exports= model;