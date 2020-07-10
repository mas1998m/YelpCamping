var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require ('passport');
const localStrategy = require('passport-local').Strategy;
const camp = require("./models/camp");
const comment= require("./models/comment");
const user = require('./models/user');
var seeds = require("./seeds");
const methodOverride = require("method-override");
const middleware = require("./middleware/");
const flash = require("connect-flash");
const dbURL = process.env.DATABASEURL||'mongodb+srv://mohamed:mo01121823018@cluster0-e58to.mongodb.net/test?retryWrites=true&w=majority';
const PORT = process.env.PORT||'5000';


mongoose.connect(dbURL,
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
app.use(methodOverride('_method'));
app.use(flash());
//seeds();
app.use(require('express-session')({
    secret:"this is my first Web App",
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req,res,next) {
    res.locals.currentUser=req.user;
    res.locals.success = req.flash("success");
    res.locals.error= req.flash("error");
    next();
})
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.get("/",function (req,res) {
    res.render("landing");
});


//================================
//======Campgrounds Routing=======
//================================
app.get("/campgrounds",function (req,res) {
    camp.find({},function (err,foundCamps) {
        if(err){
            console.log(err);
            req.flash("error","Error Viewing Campgrounds, Please Try Again Later");
            res.redirect("/");
        }
        else{
            res.render("campgrounds/index",{camps:foundCamps});
        }
    });
});

app.get("/campgrounds/new",middleware.isLoggedin,function (req,res) {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id",function (req,res) {
    camp.findById(req.params.id).populate("comments").exec(function (err,result){
        if(err){
            console.log(err);
            req.flash("error","Error Viewing This Campground, Please Try Again Later or verify the url");

        }
        else{
            res.render("campgrounds/show",{camp:result});
        }
    });
});


app.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        if(err){
            console.log(err);
        }
        else{
            res.render('campgrounds/edit',{camp:foundCamp});
        }
    })
});

app.put("/campgrounds/:id",middleware.checkCampgroundOwnership,function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        foundCamp.name = req.body.name;
        foundCamp.image = req.body.image;
        foundCamp.description = req.body.description;
        foundCamp.price= req.body.price;
        foundCamp.save();
    });
    req.flash("success","Your post details has been modified successfully!");
    res.redirect("/campgrounds/"+req.params.id);
});

app.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function (req,res) {
    camp.findByIdAndDelete(req.params.id,function (err,deletedCamp){
        if(err){
            console.log(err);
            req.flash("error","Error Deleting This Campground, Please Try Again Later or verify the campground url");
            res.redirect("back");
        }
        else{
            req.flash("success","Your post has been deleted successfully!");
            res.redirect("/campgrounds");
        }
    });
});

app.post("/campgrounds",middleware.isLoggedin,function (req,res) {
    //extract the form data and push it into the db
    var data ={
        name:req.body.name,
        image:req.body.image,
        description:req.body.description,
        author:{
            id:req.user._id,
            name:req.user.username
        },
        price:req.body.price
    }
    camp.create(data,function (err,createdCamp) {
        if(err){
            console.log(err);
            req.flash("error","Error Creating This Campground, Please Try Again Later");
        }
        else{
            console.log(createdCamp);
            req.flash("success","Your post has been created successfully!");
            //go back to the camps
            res.redirect("/campgrounds");
        }
    })
});


//==================================
//=========Comments routes==========
//==================================
app.get("/campgrounds/:id/comments/new",middleware.isLoggedin,function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        if(err){
            console.log(err);
            req.flash("error","Error Adding a comment to this Campgrounds, Please Try Again Later or verify the url");
        }
        else{
            console.log(foundCamp);
            res.render("comments/new",{camp:foundCamp});
        }
    })
});

app.post("/campgrounds/:id/comments",middleware.isLoggedin,function (req,res) {
    let data = {
        text:req.body.comment.text,
        author:{
            id:req.user._id,
            name:req.user.username
        }
    }
    comment.create(data,function (err,createdComment) {
        if(err){
            console.log(err);
            req.flash("error","Error Adding this Comment, Please Try Again Later or verify the url");
            res.redirect("back");

        }
        else{
            camp.findById(req.params.id,function (err,foundCamp) {
                if(err){
                    console.log(err);
                }
                else{
                    foundCamp.comments.push(createdComment);
                    foundCamp.save();
                    req.flash("success","Your comment has been added successfully!");
                    res.redirect("/campgrounds/"+foundCamp._id);
                }
            });
        }
    });
});

app.get("/campgrounds/:campId/comments/:commentId/edit",middleware.checkCommentOwnership,function (req,res) {
    comment.findById(req.params.commentId,function (err,foundComment) {
        if(err){
            console.log(err);
            req.flash("error","Error editing this comment, Please Try Again Later");
            res.redirect("back");
        }
        else{
            res.render("comments/edit",{campId:req.params.campId,comment:foundComment});
        }
    });

});

app.put("/campgrounds/:campId/comments/:commentId",middleware.checkCommentOwnership,function (req,res) {
    comment.findByIdAndUpdate(req.params.commentId,{text:req.body.comment.text},function (err,oldComment) {
        if(err){
            console.log(err);
            req.flash("error","Error editing this comment, Please Try Again Later");
            res.redirect("back");
        }
        else{
            console.log(oldComment);
            req.flash("success","Your comment has been edited successfully!");
            res.redirect("/campgrounds/"+req.params.campId);
        }
    });
});

app.delete("/campgrounds/:campId/comments/:commentId",middleware.checkCommentOwnership,function (req,res) {
    comment.findByIdAndDelete(req.params.commentId,function (err,Comment) {
        if(err){
            console.log(err);
            req.flash("error","Error deleting this comment, Please Try Again Later");
        }
        else{
            req.flash("success","Your comment has been deleted successfully!");
            res.redirect("/campgrounds/"+req.params.campId);
        }
    });
});

//===================================
//=======Authentication routes=======
//===================================

app.get("/register",function (req,res) {
    res.render('register');
})

app.post("/register",function (req,res) {
    var newUser = new user({username:req.body.username});
    user.register(newUser, req.body.password,function (err,user) {
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req,res,function () {
            req.flash("success","Successfully registered, Welcome to Yelpcamp "+req.user.username + " :D");
            res.redirect("/campgrounds");
        });
    });
});


app.get("/login",function (req,res) {
    res.render('login');
})

app.post("/login",passport.authenticate('local',
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login",
        failureFlash: true,
        successFlash:"Welcome Back :D"
    }),function(req,res) {
});


app.get("/logout",function (req,res) {
    req.flash("success","successfully logged you out, Bye Bye "+req.user.username+" :/");
    req.logout();
    res.redirect("/");
});



app.listen(PORT,process.env.IP,function () {
    //test if the server is working
    console.log("Listening Now on Port "+ PORT);
    console.log(process.env.test);
});
