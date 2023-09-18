const Product =require('../models/productModel');
const ErrorHandler = require('../utis/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utis/apiFeatures')
//Get product - /api/v1/product
exports.getProducts = catchAsyncError(async (req,res,next) =>{
  try {
    const resPerPage = "4"; // Define your responsePerPage value
    
    let buildQuery = () =>{
      return new APIFeatures(Product.find(), req.query).search().filter();
    }

    const filterProductsCount =await  buildQuery().query.countDocuments({});                    //in this query contains all the return value in search and filter
    const totalProductsCount = await Product.countDocuments({});
    let productsCount = totalProductsCount;
    
    if(filterProductsCount !==totalProductsCount){
      productsCount = filterProductsCount;
    }
    const products = await buildQuery().paginate(resPerPage).query;                          //in this query contains return value of the paginate function

    res.status(200).json({
      success: true,
      count:productsCount,
      resPerPage,
      products
    });
  } catch (error) {
    // Handle the error by passing it to the error handling middleware
    return next(error);
  }
});
//Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError (async  (req,res,next)=>{   //in this req.user is in authenticate.js->isAuntenticatedUser
 
  let images = []
  let BASE_URL = process.env.BACKEND_URL;
  if(process.env.NODE_ENV === "production"){
      BASE_URL = `${req.protocol}://${req.get('host')}`
  }
  
  if(req.files.length > 0) {
      req.files.forEach( file => {
          let url = `${BASE_URL}/uploads/product/${file.originalname}`;
          images.push({ image: url })
      })
  }

  req.body.user = req.user.id;            //req.body contains all the info abt product like id,name,price etc.,   and give the user id to user field that aldready in the product model
  
  const product= await Product.create(req.body);   //Here Product is the collection in the database  || Create function take the value and create a document in the database
  res.status(200).json({
    success:true,
    product
  });
});

//Get Single Product - /api/v1/product/:id
exports.getsingleProduct = async (req, res, next) => {
        const product = await Product.findById(req.params.id).populate('reviews.user' , 'name email');

    if (!product) {
      return next(new ErrorHandler('Product not Founded', 404) )  //it is a constructor
    }
     res.status(200).json({
      success: true,
      product
    });
};


//Update Product - /api/v1/product/:id
exports.updateProduct =async(req,res,next)=>{
 let product= await Product.findById(req.params.id)

  //uploading images
  let images = []

  //if images not cleared we keep existing images
  if(req.body.imagesCleared === 'false' ) {
      images = product.images;
  }
  let BASE_URL = process.env.BACKEND_URL;
  if(process.env.NODE_ENV === "production"){
      BASE_URL = `${req.protocol}://${req.get('host')}`
  }

  if(req.files.length > 0) {
      req.files.forEach( file => {
          let url = `${BASE_URL}/uploads/product/${file.originalname}`;
          images.push({ image: url })
      })
  }


  req.body.images = images;

 if(!product){
  return res.status(404).json({
     success:false,
     message:"Product not Found"
   });
  }

 product=await Product.findByIdAndUpdate(req.params.id, req.body,{
    new:true,   //we need updated value                |---\
    runValidators: true   //it validates the data      |---/   Its all findByIdAndUpdate function default options
  })
  res.status(200).json({
    success:true,
    product
  });

};


//Delete Product - /api/v1/product/:id
exports.deleteProduct = async(req,res,next)=>{
 
  const product =await Product.findById(req.params.id);

  if(!product){
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }
 await product.deleteOne();

 res.status(200).json({
  success:true,
  message: "Product Deleted"
 })
}

//Create review -api/v1/review
exports.createReview = catchAsyncError (async  (req,res,next)=>{ 
  const {productId , rating , comment} = req.body;

  const review = {
    user : req.user.id,
    rating,
    comment
  }
  const product = await Product.findById(productId);
 const isReviewed = product.reviews.find(review =>{
   return review.user.toString() ==req.user.id.toString()
  })
// Finding user review exist
  if(isReviewed){
    product.reviews.forEach(review =>{
      if( review.user.toString() ==req.user.id.toString()){
        review.comment = comment;
        review.rating= rating;
      }
    })
  } else{    //creating the review
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }
//Find the average of user reviews
  product.ratings = product.reviews.reduce((acc , review) =>{           // review la irukkura motha rating value ayum add panni anuppurathu dhan reduce() itdhula 0la irundhu dhan start aagum  
    return review.rating + acc;
  } ,0) / product.reviews.length;                     //if there is no rating it will return NaN so we use below if cond..
  product.ratings = isNaN(product.ratings)?0: product.ratings;

 await product.save({validateBEforeSave: false});

 res.status(200).json({
  success:true,
 })
})

//Get Reviews - api/v1/reviews?id={productid}
exports.getReviews = catchAsyncError (async  (req,res,next)=>{ 
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    success:true,
    reviews:product.reviews.populate('reviews.user' , 'name email')
   })
})

//Delete review - api/v1/review
exports.deleteReview = catchAsyncError (async  (req,res,next)=>{
  const product = await Product.findById(req.params.id);
  //Filtering the reviews that doesnt match the review id
  const reviews = product.reviews.filter(review =>{
   return review._id.toString() !== req.query.id.toString()
  });
  //Number of reviews
  const numofReviews = reviews.length();
  let ratings = reviews.reduce((acc , review) =>{           // review la irukkura motha rating value ayum add panni anuppurathu dhan reduce() itdhula 0la irundhu dhan start aagum  
    return review.rating + acc;
  } ,0) / product.reviews.length;
  ratings = isNaN(product.ratings)?0:ratings;
  //Saving the product document
  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numofReviews,
    ratings
  });
  res.status(200).json({
    success:true,
   
   })
}) 

// get admin products  - api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async (req, res, next) =>{
  const products = await Product.find();
  res.status(200).send({
      success: true,
      products
  })
});
