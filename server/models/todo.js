var mongoose = require('mongoose');
var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true //remove space from start and end of string.
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

module.exports = {
    Todo
}

// var newTodo = new Todo({
//     text: 'walk the dog'
// });

// newTodo.save().then((results)=>{
//     console.log('Saved todo', results)
// }).catch((err)=>{
//     console.log('Unable to save todo', err)
// })