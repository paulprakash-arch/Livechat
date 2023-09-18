const products = require('../data/products.json');
const Product = require('../models/productModel');
const dotenv =require('dotenv');
const connectDatabase = require('../config/database');

dotenv.config({path:'server/config/config.env'});
connectDatabase();  //We have deleteMany and insertMany so we connect db in this 'i think so'
const seedProducts = async()=>{
  try{ 
    await Product.deleteMany();   //Here Product is the collection in the database
   console.log("Deleted");
   await Product.insertMany(products);
   console.log("All products added");
} catch(e){
    console.log(e.message);
}
process.exit();
}

seedProducts();