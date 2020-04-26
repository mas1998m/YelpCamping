var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

var camps = [
    {name:"Bedouin Star" , image:"https://media-cdn.tripadvisor.com/media/photo-m/1280/15/6f/da/a5/bedouin-star.jpg"},
    {name:"Badry Sahara Camp" , image:"https://media-cdn.tripadvisor.com/media/photo-o/01/a2/36/a8/chozas-con-jardin.jpg"},
    {name:"Baraka Camp" , image:"https://media-cdn.tripadvisor.com/media/photo-m/1280/14/47/e4/78/caption.jpg"},
    {name:"Ayla Camp" , image:"https://media-cdn.tripadvisor.com/media/photo-w/0a/10/f7/4e/main-hut.jpg"}
];

app.get("/",function (req,res) {
    res.render("landing");
});

app.get("/campgrounds",function (req,res) {

    res.render("campgrounds",{camps:camps});
});

app.get("/campgrounds/new",function (req,res) {
    res.render("newCamp");
});

app.post("/campgrounds",function (req,res) {
    var name = req.body.name;
    var image = req.body.image;
    camps.push({name:name,image: image});
    res.redirect("/campgrounds");
});


app.listen("3042",function () {
    console.log("Listening Now");
});
