var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');

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

const campSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String
});

const camp =mongoose.model("Camp",campSchema);


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
            res.render("index",{camps:foundCamps});
        }
    });
});

app.get("/campgrounds/new",function (req,res) {
    res.render("new");
});

app.get("/campgrounds/show/:id",function (req,res) {
    camp.findById(req.params.id,function (err,result) {
        if(err){
            console.log(err);
        }
        else{
            console.log("Camp Found");
            res.render("show",{camp:result});
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


app.listen("3042",function () {
    //test if the server is working
    console.log("Listening Now");
});
