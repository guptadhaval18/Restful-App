const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: function(value){
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email.'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [{
        access:{
            type: String,
            required: true
        },
        token:{
            type: String,
            required: true
        }
    }]
});

// overwrite function to send back only _id and email.
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject(); //Convert mongo object to object

    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function(){
    var user=this;

    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(()=>{
        return token;
    })
}

UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
    return User.findOne({email}).then((user) => {
        if(!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) resolve(user);
                else reject();
            });
        }); 
    });
}

UserSchema.methods.removeToken = function(token) {
    var user = this;

    return user.update({
        $pull:{
            tokens: {token}
        }
    })
}

//model methods
UserSchema.statics.findByToken = function(token){
    var User = this;
    var decode;
    try{
        decode = jwt.verify(token, process.env.JWT_SECRET);
    } catch(err){
        return Promise.reject();
    }

    return User.findOne({
        '_id': decode._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

// Mongoose middleware. 
// This function will always happen before save function
UserSchema.pre('save', function(next){
    var user = this;

    if(!user.isModified('password')) next();

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt, function(err, hash){
            user.password = hash;
            next();
        });
    });

})

var User = mongoose.model('User', UserSchema);
module.exports = {
    User
}

// var newUser = new User({
//     email: "guptadhaval18@gmail.com"
// });
// newUser.save().then((results)=>{
//     console.log('Saved user', results)
// }).catch((err)=>{
//     console.log('Unable to save user', err)
// });