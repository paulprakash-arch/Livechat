const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name :{
        type : String,
        required : [true , "Please enter Product name"],
        trim: true,     //cut the space btw name starting and ending
        maxlength:[100, 'Product name cannot exceed 100 characters' ]
    },
    price :{
        type : String,
        //required : [true , "Please enter Product name"],  we dont need required field bcoz we have default value 
        default : 0.0,
    },
    description :{
        type : String,
        required : [true , "Please enter Product description"],
    },
    ratings :{
        type :String,
        default:0
    },
    images:[
        {
            image:{
                type:String,
                required:true
            }
        }
    ],
    user :{
        type:mongoose.Schema.Types.ObjectId
    },
    category:{
        type:String,
        required :[true, 'Please enter Product Category'],
        enum :{
            values:['Electronics',
            'MobilePhones',
            'Laptops',
            'Accessories',
            'Food',
            'Books',
            'Clothes/Shoes',
            'Sports',
            'Outdoor',
            'Home'
        ],
        message: "Please select valid category"
        }
    },
    seller :{
        type:String,
        required:[true , 'Please enter Product Seller']
    },
    stock :{
        type: Number,
        required :[true , 'Please enter Product Stock '],
        maxlength:[30 , 'Product stock cant exceed 30']
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{
            type:  mongoose.Schema.Types.ObjectId,
            ref:'User'     //user model reference
        },
        rating:{
            type:String,
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    }],
    user:{
        type: mongoose.Schema.ObjectId
    },
    createAt:{
        type:Date,
        default:Date.now()
    }
})

let schema = mongoose.model('Product', productSchema)  //the model() function returns a model we named the model Product & we give the schema-productschema  and it gives the model
module.exports = schema