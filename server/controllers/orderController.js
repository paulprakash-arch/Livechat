const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const ErrorHandler = require('../utis/errorHandler');
const Product = require('../models/orderModel');
//Create new order - api/v1/order/new
exports.newOrder = catchAsyncError(async(req,res,next)=>{
    const {orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;
console.log("Orderget");

    const order = await Order.create ({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt:Date.now(),
        user:req.user.id,
    });
    console.log("Ordered");
    res.status(200).json({
        success:true,
        order
    })
})

//Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{
   const order = await Order.findById(req.params.id).populate('user' , 'name email')   //here product contains user field so we use populate and get name email
   if(!order){
    return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`) ,404);
   }

   res.status(200).json({
    success:true,
    order
   })
})

//Get Loggedin user orders - api/v1/myorders
exports.myOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user:req.user.id});     //we get req.id from isAuthenticated
    if(!orders){
     return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`) ,404);
    }
 
    res.status(200).json({
     success:true,
     orders
    })
 })

//Admin get all orders - api/v1/orders
exports.orders= catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find();    
    if(!orders){
     return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`) ,404);
    }
 let totalAmount = 0;
 orders.forEach(order =>{
    totalAmount += order.totalPrice
 })
    res.status(200).json({
     success:true,
     totalAmount,
     orders
    })
 })

 //Admin Update orders - api/v1/order:id
exports.updateOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(order.orderStatus == 'Delivered'){
        return next(new ErrorHandler('Order has been already delivered') , 400);
    }
    //Updating the product stock of each order items
    order.orderItems.forEach( async orderItem =>{
      await  updateStock(orderItem.product,orderItem.quantity);
    })
    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({
        success:true,
       })
})

async function updateStock (productId ,quantity){
    const product = Product.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBEforeSave: false})
}

//Admin Delete order - api/v1/order/:id
exports.deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`) ,404);
       }
       await order.deleteOne();
       res.status(200).json({
        success:true,
       })

})