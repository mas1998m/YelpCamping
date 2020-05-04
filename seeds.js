var mongoose = require("mongoose"),
    camp = require("./models/camp"),
    Comment = require("./models/comment");

var data = [
    {
        name:"Crazy Horse",
        image:"https://media-cdn.tripadvisor.com/media/photo-m/1280/15/6f/da/a5/bedouin-star.jpg",
        description:"Some quick example text to build on the card title and make up the bulk of the card's content."
    },
    {
        name:"Dagwood",
        image:"https://media-cdn.tripadvisor.com/media/photo-o/01/a2/36/a8/chozas-con-jardin.jpg",
        description:"Some quick example text to build on the card title and make up the bulk of the card's content."
    },
    {
        name:"Dakota",
        image:"https://media-cdn.tripadvisor.com/media/photo-w/0a/10/f7/4e/main-hut.jpg",
        description:"Some quick example text to build on the card title and make up the bulk of the card's content."
    }
];


function seedsDB(){
    camp.deleteMany({} , function (err) {
        if(err){
            console.log(err);
        }
        else{
            data.forEach(function (element){
                camp.create(element,function (err,createdCamp) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log("camp created");
                        Comment.create({
                            author:"Mohamed Abdullah",
                            text:"Spent a week there and it was a nice camp <3"
                        },function (err,createdComment) {
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("comment created");
                                createdCamp.comments.push(createdComment);
                                createdCamp.save();
                                console.log("comment saved");
                            }
                        });
                    }
                });
            });
        }
    });
}


module.exports = seedsDB;