const sendToken = (user,statusCode,res) =>{
    const token =user.getJwtToken();  //Creatin jwt token  || This line generates the JWT token using the getJwtToken method of the user object. This method likely creates and signs a JWT token based on the user's data (such as the user's ID).

    //setting cookies
    const options ={
        expires:new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME *24*60*60*1000), //add 7 days
        httpOnly :true,   //cant access via js

    }

    res.status(statusCode).cookie('token' , token , options).json({         
        success:true,
        token,
        user,
    })
};


module.exports = sendToken;