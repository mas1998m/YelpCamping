var mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoosess");
const userSchema = new mongoose.Schema({
    userName:String,
    passowrd:String,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);