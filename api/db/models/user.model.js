const mongoose= require('mongoose');
const _= require('lodash');
const jwt= require('jsonwebtoken');
const { reject } = require('lodash');
const crypto = require('crypto');
const { resolve } = require('path');

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

userSchema.methods.generateAccessAuthToken = function(){
    const user=this;
    return new Promise((resolve, reject) => {
        //creat and return the JWT (JASON web token)
        jwt.sign({_id: user._id.toHexString() },jwtSecret,{expiresIn: "10m"}), (err,token) => {
            if(!err){ resolve(token);}
        }else{ reject();}
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