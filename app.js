var express = require("express");
var app = express();
var request = require("request");
app.set("view engine","ejs");
app.use(express.static('public'));



app.get("/",function (req,res) {
    res.render("landing");
});

app.get("/campgrounds",function (req,res) {
    res.render("campgrounds");
});


app.listen("3042",function () {
    console.log("Listening Now");
});
