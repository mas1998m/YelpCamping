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
const middleware = require("./middleware");

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
app.use(methodOverride('_method'));

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
    next();
})
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


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


//================================
//======Campgrounds Routing=======
//================================
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

app.get("/campgrounds/new",isLoggedin,function (req,res) {
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


app.get("/campgrounds/:id/edit",checkCampgroundOwnership,function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        if(err){
            console.log(err);
        }
        else{
            res.render('campgrounds/edit',{camp:foundCamp});
        }
    })
});

app.put("/campgrounds/:id",checkCampgroundOwnership,function (req,res) {
    camp.findById(req.params.id,function (err,foundCamp) {
        foundCamp.name = req.body.name;
        foundCamp.image = req.body.image;
        foundCamp.description = req.body.description;
        foundCamp.save();
    });
    res.redirect("/campgrounds/"+req.params.id);
});

app.delete("/campgrounds/:id",checkCampgroundOwnership,function (req,res) {
    camp.findByIdAndDelete(req.params.id,function (err,deletedCamp){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds");
        }
    });
});

app.post("/campgrounds",isLoggedin,function (req,res) {
    //extract the form data and push it into the db
    var data ={
        name:req.body.name,
        image:req.body.image,
        description:req.body.description,
        author:{
            id:req.user._id,
            name:req.user.username
        }
    }
    camp.create(data,function (err,createdCamp) {
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


//==================================
//=========Comments routes==========
//==================================
app.get("/campgrounds/:id/comments/new",isLoggedin,function (req,res) {
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

app.post("/campgrounds/:id/comments",isLoggedin,function (req,res) {
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

app.get("/campgrounds/:campId/comments/:commentId/edit",checkCommentOwnership,function (req,res) {
    comment.findById(req.params.commentId,function (err,foundComment) {
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/edit",{campId:req.params.campId,comment:foundComment});
        }
    });

});

app.put("/campgrounds/:campId/comments/:commentId",checkCommentOwnership,function (req,res) {
    comment.findByIdAndUpdate(req.params.commentId,{text:req.body.comment.text},function (err,oldComment) {
        if(err){
            console.log(err);
        }
        else{
            console.log(oldComment);
            res.redirect("/campgrounds/"+req.params.campId);
        }
    });
});

app.delete("/campgrounds/:campId/comments/:commentId",checkCommentOwnership,function (req,res) {
    comment.findByIdAndDelete(req.params.commentId,function (err,Comment) {
        if(err){
            console.log(err);
        }
        else{
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
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function () {
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
        failureRedirect:"/login"
    }),function(req,res) {
});


app.get("/logout",function (req,res) {
    req.logout();
    res.redirect("/");
});

function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        camp.findById(req.params.id,function (err,foundCamp) {
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else{
                if(foundCamp.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect("back");
                }
            }
        });
    }
    else{
        res.redirect("back");
    }
}

function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.commentId,function (err,foundComment) {
            if(err){
                console.log(err);
                res.redirect("back");
            }
            else if(foundComment.author.id.equals(req.user._id)){
                next();
            }
            else{
                res.redirect("back");
            }
        });
    }
    else{
        res.redirect("back");
    }
}

app.listen("3042",function () {
    //test if the server is working
    console.log("Listening Now");
});
