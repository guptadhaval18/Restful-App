const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res)=>{
    var todo = new Todo({
        text: req.body.text
    });
    
    todo.save().then((results)=>{
        res.send(results);
    }).catch((err)=>{
        res.status(400).send(err);
    })
});

app.get('/todos', (req, res)=>{
    Todo.find().then((todos)=>{
        res.send({todos});
    }).catch((err)=>{
        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res)=>{
    var id = req.params.id;
    
    if(!ObjectID.isValid(id)) return res.status(400).send();

    Todo.findById(id).then((todo) => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res)=>{
    var id = req.params.id;
    
    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Something went wrong!'});

    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res)=>{
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed'])    
    
    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Something went wrong!'});

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } 
    else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    });
});

app.listen(port, ()=>{
    console.log(`Started on port ${port}`)
});

module.exports = {app};



