const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
    _id: userOneID,
    email: "testone@gmail.com",
    password: "testpasswordone",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneID, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoID,
    email: "testtwo@gmail.com",
    password: "testpasswordtwo",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];


const todos = [{
    _id: new ObjectID(),
    text: "First test todo",
    _creator: userOneID
}, {
    _id: new ObjectID(),
    text: "Second test todo",
    _creator: userTwoID
}];

var populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
}

var populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        //Due to 'all' it will wait for both save.
        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {
    todos,
    users,
    populateTodos,
    populateUsers

}