const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');
const { User } = require('../models/user');



beforeEach(populateTodos);
beforeEach(populateUsers);


describe('POST /todos', ()=>{
    it('Should create a new todo.', (done)=>{
        var text = 'Testing todo route';
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err, res)=>{
                if(err) return done(err);
                // Check if the correct data has benn uploaded to mongosDb
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err)=>{
                    done(err);
                })
            })
    });

    it('Should not create a new todo, invalid data.', (done)=>{
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res)=>{
                if(err) return done(err);
                // Check if the correct data has benn uploaded to mongosDb
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err)=>{
                    done(err);
                })
            })
    });
});

describe('GET /todos', ()=>{
    it('Should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1)
            })
            .end(done);
    })
});

describe('GET /todos/:id', ()=>{
    it('Should return todo doc by id', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });
    it('Should not return todo doc created by other user.', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('Should return 404 if todo is not found', (done) => {
        var hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('Should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123abc`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end(done);
    });
});

describe('DELETE /todos/:id', ()=>{
    it('Should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[1].text)
            })
            .end((err, res)=>{
                if(err) return done(err);

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeNull();
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    });
    it('Should not remove a todo if from different user', (done) => {
        var hexId = todos[0]._id.toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res)=>{
                if(err) return done(err);

                Todo.findById(hexId).then((todo) => {
                    expect(todo).not.toBeNull();
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    });
    it('Should return 404 if todo not found', (done) => {
        var hexID = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('Should return 400 if ObjectID is invalid', (done) => {
        request(app)
            .delete(`/todos/123abc`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(400)
            .end(done);
    });
});

describe('PATCH /todos/:id', ()=>{
    it('Should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "This should be the new text";
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof parseInt(res.body.todo.compleatedAt)).toBe('number');
            })
            .end(done);
    });
    it('Should not update the todo if created by other user', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "This should be the new text";
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(404)
            .end(done);
    });
    it('Should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = "This should be the new text";
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                compleated: false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(typeof parseInt(res.body.todo.compleatedAt)).toBe('number');
            })
            .end(done);
    });
});

describe('GET /users/me', ()=>{
    it('Should return user if authenticated', (done) => {
        request(app)
            .get(`/users/me`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });
    it('Should return 401 if not authenticated', (done) => {
        request(app)
            .get(`/users/me`)
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', ()=>{
    it('Should create a user', (done) => {
        var email = 'test@gmail.com'
        var password = '565767fhhtgdk'
        request(app)
            .post(`/users`)
            .send({email, password})
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeNull();
                expect(res.body._id).not.toBeNull();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if(err) return done(err);

                User.findOne({email}).then((user) => {
                    expect(user).not.toBeNull();
                    expect(user.password).not.toBe(password);
                    done();
                })
            });
    });
    it('Should return validation errors if request is invalid', (done) => {
        request(app)
            .post(`/users`)
            .send({
                email: "hgfhg",
                password: "gj"
            })
            .expect(400)
            .end(done);
    });
    it('Should not create user if email in use', (done) => {
        request(app)
            .post(`/users`)
            .send({
                email: users[0].email,
                password: "gjyjty88675885"
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', ()=>{
    it('Should login user and return auth token.', (done) => {
        request(app)
            .post(`/users/login`)
            .send({
                email: users[0].email,
                password: users[0].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeNull();
            })
            .end((err, res) => {
                if(err) return done(err);
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens[1]).toHaveProperty('access', 'auth');
                    expect(user.tokens[1]).toHaveProperty('token', res.headers['x-auth']);
                    done();
                }).catch((err) => done(err));
            });
    });
    it('Should reject invalid login', (done) => {
        request(app)
            .post(`/users/login`)
            .send({
                email: users[0].email,
                password: users[0].password+'1'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeNull();
            })
            .end((err, res) => {
                if(err) return done(err);
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('DELETE /users/me/token', ()=>{
    it('Should remove auth token on logout.', (done) => {
        request(app)
            .delete(`/users/me/token`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if(err) return done(err);
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((err) => done(err));
            });
    });
});