let middlewareObj = {};
let comment = module.require("../models/comment");
let user = module.require("../models/user");
let camp = module.require("../models/camp");


middlewareObj.checkCommentOwnership= function (req,res,next) {
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
                req.flash("error"," Sorry, You aren't the owner of this comment. You can't edit or delete it");
                res.redirect("back");
            }
        });
    }
    else{
        req.flash("error","Please login first before doing that");
        res.redirect("back");
    }
}

middlewareObj.checkCampgroundOwnership = function (req,res,next) {
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
                    req.flash("error"," Sorry, You aren't the owner of this post. You can't edit or delete it");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","Please login first before doing that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedin = function (req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please login first before doing that");
    res.redirect("/login");
}

module.exports = middlewareObj;