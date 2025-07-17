const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    items:[
        { type : String , required : true }
    ],
    totalAmount:{ type : String , required : true },
    shippingAddress:{
        name : {type : String , required : true},
        phone : {type : String , required : true},
        street : {type : String , required : true },
        city : {type : String , required : true },
        district : {type : String , required : true },
        pincode : {type : String , required : true },
        state : {type : String , required : true },
    },
    dtdcReferenceNumber:{ type : String , required : true},
    shippingLabelBase64 : { type : String , required : true},
    labelGenerated :  { type: Boolean, default: false },
})
module.exports = mongoose.model("Order", orderSchema);