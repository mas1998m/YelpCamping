var mongoose = require("mongoose");

const campSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String
});

module.exports = mongoose.model("Camp",campSchema);