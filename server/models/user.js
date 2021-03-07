var mongoose = require('mongoose');
var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    }
});
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