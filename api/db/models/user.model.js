const mongoose= require('mongoose');
const _= require('lodash');
const jwt= require('jsonwebtoken');
const { reject } = require('lodash');
const crypto = require('crypto');
const { resolve } = require('path');
const bcrypt = require('bcryptjs');

//JWT secret
const jwtSecret = "fdh7843fhcr48f34fhufidjsahgf84739957hbncoerqasbn963rtjgbt78es jtydxcn";

const userSchema=new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

// instance methods

userSchema.methods.toJSON = function () 
{
    const user= this;
    const userObject = user.toObject();

    // return the doc without password and sessions (that shouldn't be public)
    return _.omit(userObject, ['password','sessions']) 
}

userSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        //creat and return the JWT (JASON web token)
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "10m" }, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                reject();
            }
        })
    })
}


userSchema.methods.generateRefreshAuthToken = function() {
    // this function generate a string- it doesn,t save it to the DB, saveSessionToDatabase() does.
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64,(err, buf) => {
            if(!err){
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

userSchema.methods.createSesstion = function() {
    let user =this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user,refreshToken);
    }).then((refreshToken)=>{
        return refreshToken;
    }).catch((e)=>{
        return Promise.reject('failed to save session to DB/n' + e);
    })
}

//  model methods (static)

userSchema.statics.findByIdAndToken = function(_id,token) {
    // used in auth middleware (varifySession)
    const user = this;
    return user.findOne({
        _id,
        'sessions.token': token
    });
}

userSchema.statics.findByCredentials = function(email,password) {
    let user = this;
    return user.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res){
                     resolve(user);
                }else{
                    reject();
                }
            })
        })
    })

}

userSchema.static.hasRefreshTokenExpired = (expiresAt)=>{
    // Epoch = 1.1.1970 00:00 time stamp
    let secondsSinceEpoch = Date.now() / 1000;
    if(expiresAt>secondsSinceEpoch){
        return false;
    } else {
        return true;
    }
}

//middleware
//before a user doc is saved, this code runs
userSchema.pre('save', function (next) {
    let user = this;
    // number of hashing rounds
    let costFactor = 10;

    
    if(user.isModified('password')) {
        //generate salt and hash password
        bcrypt.genSalt(costFactor, (err,salt)=>{
            bcrypt.hash(user.password, salt,(err,hash)=> {
                user.password = hash;
                next();
            })
        })
    }else{
        next();
    }
})


// helper methods

let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((res,rej)=> {
        let expiresAt = generateRefreshTokenExpiryTime();
        user.sessions.push({'token': refreshToken, expiresAt});
        user.save().then(()=>{
            //session saved
            return resolve(refreshToken);
        }).catch((e)=>{
            reject(e);
        });
    })
}

let generateRefreshTokenExpiryTime= () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire *24)*60)*60;
    return((Date.now()/1000)+secondsUntilExpire);
}

const User = mongoose.model('User', userSchema);

module.exports = {User}