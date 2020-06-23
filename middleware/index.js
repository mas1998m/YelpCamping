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
                res.redirect("back");
            }
        });
    }
    else{
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
                    res.redirect("back");
                }
            }
        });
    }
    else{
        res.redirect("back");
    }
}

middlewareObj.isLoggedin = function (req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = middlewareObj;