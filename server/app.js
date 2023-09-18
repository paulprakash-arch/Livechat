const express = require("express");
const app =express();
const dotenv = require('dotenv');

const products =require('./routes/product');
const auth =require('./routes/auth');
const order =require('./routes/order');
const payment = require('./routes/payment');

const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error');
const path = require('path')
dotenv.config({path:path.join(__dirname,'config/config.env')});


app.use(express.json());
app.use(express.urlencoded({extended: false})); 
app.use(cookieParser());
app.use('/uploads',  express.static(path.join(__dirname, 'uploads')));    //we convert the uploads folder to static

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', payment);

if(process.env.NODE_ENV='production'){
  app.use (express.static(path.join(__dirname , '../client/build')));
  app.get("*" , (req,res) =>{
    res.sendFile(path.resolve(__dirname , '../client/build/index.html'))
  })
}

app.use(errorMiddleware);            // common middleware for all api


module.exports = app;