var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
const camp = require("./models/camp");
const comment= require("./models/comment");
var seeds = require("./seeds");
mongoose.connect('mongodb+srv://mohamed:mo01121823018@cluster0-e58to.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

mongoose.connection.on('connected',function () {
    console.log('db connected!!');
})

app.set("view engine","ejs"); //set ejs as the default view engine
app.use(express.static('public')); //use "public" directory as the assets directory
app.use(bodyParser.urlencoded({extended:true})); // use body-parser package to parse the post data

seeds();


// camp.update({},{description:"Some quick example text to build on the card title and make up the bulk of the card's content."},      {multi:true},function (err,out) {
//     if(err){
//         console.log("error happened");
//         console.log(err);
//     }
//     else{
//         console.log(out);
//     }
// });
// currentCamp.save(function (err,camp) {
//     if(err){
//         console.log("Error saving the Camp");
//         console.log(err);
//     }
//     else{
//         console.log(camp);
//     }
// });
//
// camp.find({},function (err,camps) {
//     if(err){
//         console.log("Error finding the Camp");
//         console.log(err);
//     }
//     else{
//         console.log(camps);
//     }
// });

app.get("/",function (req,res) {
    res.render("landing");
});

app.get("/campgrounds",function (req,res) {
    camp.find({},function (err,foundCamps) {
        if(err){
            console.log("error finding Camps");
            console.log(err);
        }
        else{
            console.log("succesfully found camps");
            res.render("campgrounds/index",{camps:foundCamps});
        }
    });
});

app.get("/campgrounds/new",function (req,res) {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id",function (req,res) {
    camp.findById(req.params.id).populate("comments").exec(function (err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log("Camp Found");
            res.render("campgrounds/show",{camp:result});
        }
    });
});


app.post("/campgrounds",function (req,res) {
    //extract the form data and push it into the db
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    camp.create({name:name,image:image,description:description},function (err,createdCamp) {
        if(err){
            console.log("an error happened");
            console.log(err);
        }
        else{
            console.log("Camp Created");
            console.log(createdCamp);

            //go back to the camps
            res.redirect("/campgrounds");
        }
    })
});


// =================================
// Comments routes
// =================================
app.get("/campgrounds/:id/comments/new",function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        if(err){
            console.log(err);
        }
        else{
            console.log(foundCamp);
            res.render("comments/new",{camp:foundCamp});
        }
    })
});


app.post("/campgrounds/:id/comments",function (req,res) {
    comment.create(req.body.comment ,function (err,createdComment) {
        if(err){
            console.log(err);
        }
        else{
            camp.findById(req.params.id,function (err,foundCamp) {
                if(err){
                    console.log(err);
                }
                else{
                    foundCamp.comments.push(createdComment);
                    foundCamp.save();
                    res.redirect("/campgrounds/"+foundCamp._id);
                }
            });
        }
    } );
});






app.listen("3042",function () {
    //test if the server is working
    console.log("Listening Now");
});
