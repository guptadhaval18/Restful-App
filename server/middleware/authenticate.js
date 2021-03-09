var {User} = require('./../models/user');
// middleware function to authenticate user before going to 
// any page with logged in as a particular user
// Here, we store data in 'req' so that we can retrieve 
// that info in 'req' of function where this middleware is called. 
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if(!user) return Promise.reject();
        req.user = user;
        req.token = token;
        next();
    }).catch((err) => {
        res.status(401).send();
    })
}

module.exports = {
    authenticate
}