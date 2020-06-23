var mongoose = require('mongoose');
var user = require('./user');


var commentSchema = new mongoose.Schema({
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name:String
    },
    text:String,
    time:{type:Date,default:Date.now()}
});


module.exports = mongoose.model("Comment",commentSchema);