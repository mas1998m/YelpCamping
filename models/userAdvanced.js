const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:5,
        max:15
    },
    password:{
        type:String,
        required:true,
        min:5,
        max:15
    },
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});


User = mongoose.model('User',userSchema);


//used with the model itself
userSchema.statics.findByCredentials= async function f(username,password) {
    const user =await User.findOne({username:username});
    if(!user){
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user;
}




//used for Queries and instances.
userSchema.methods.generateAuthToken = async function(){
    const user =this;
    const token = jwt.sign({_id:user._id.toString()},'thisIsAnotherSecret');
    user.tokens.push({token});
    await user.save();
    return token;
}


//automatically called when sending responses as it stringifies the object which calls toJSON function
//deleting data which shouldn't be sent back to the client side
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}




app.post("/user/login",async function (req,res) {
    const user = await User.findByCredentials(req.body.username,req.body.password);
    const token = await user.generateAuthToken();

})

app.post("/user/register",async function (req,res) {
    User.create({username,password},async function (err,user) {
        const token = await user.generateAuthToken();
        user.tokens.push({token});
        user.save();
        res.send({user,token});
    });

})

async function webToken() {
    const token = jwt.sign({_id:"abcd"},'thisIsTheSecret',{expiresIn:'7 days'});
    const data = jwt.verify(token,'thisIsTheSecret'); //retrieves the data encoded in the token
}

//middleware
async function auth(req,res,next) {
    try{
        const token = req.get('Authorization').replace('Bearer ',''); //get the token stored in the request
        const decoded = jwt.verify(token,'thisIsTheSecret'); //decode it
        const user = await User.findOne({_id:decoded._id,'tokens.token':token});
        if(user){
            req.token= token;
            req.user = user;
            next();
        }
    }
    catch{

    }
}

