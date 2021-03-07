const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/ToDoApp', { useNewUrlParser: true}, (err, client)=>{
    if(err) return console.log('Unable to connect to MongoDB server');
    console.log('Connected to MongoDB server.');

    const db = client.db('TodoApp');

    db.collection('Todos').insertMany([
        {
            name: 'Dhaval',
            age: 22,
            location: 'Greater Noida'
        },
        {
            text: 'Something to do.',
            completed: false
        }
    ], (err, result)=>{
        if(err) return console.log('Unable to add todo');
        console.log(JSON.stringify(result.ops, undefined, 2));
    });
    client.close();
});