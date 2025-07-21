const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    items:[
        {
        productId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "Product",
        required: true
        },
        productName : {type : String },
        quantity : {type : Number , required : true },
        price : { type : Number , required : true },
        total: {type : Number}
    }
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress:{
        name : {type : String , required : true},
        phone : {type : String , required : true},
        street : {type : String , required : true },
        city : {type : String , required : true },
        district : {type : String , required : true },
        pincode : {type : String , required : true },
        state : {type : String , required : true },
    },
    dtdcReferenceNumber:{ type : String},
    shippingLabelBase64 : { type : String },
    labelGenerated :  { type: Boolean, default: false },
    status : { 
        type : String,
        enum : ["pending","confirmed","shipped","delivered","cancelled"],
        default : "pending"
    },
    paymentStatus : {
        type : String,
        enum : ["pending","paid","failed"],
        default : "pending"
    },
    paymentMethod :{
        type : String,
        enum : ["cod","upi","card","netbanking"],
        default : "cod"
    },
    createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model("Order", orderSchema);