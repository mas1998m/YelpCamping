var mongoose = require("mongoose");
var Comment = require("./comment");
var User = require("./user");


const campSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    date:{type:Date,default: Date.now()},
    price:Number,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name:String
    },
    comments:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model("Camp",campSchema);