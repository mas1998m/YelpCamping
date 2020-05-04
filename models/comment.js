var mongoose = require('mongoose');



var commentSchema = new mongoose.Schema({
    author:String,
    text:String,
    time:{type:Date,default:Date.now()}
});


module.exports = mongoose.model("Comment",commentSchema);