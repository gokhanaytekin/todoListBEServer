// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var counters = require('./counters');

// create a schema
var todosSchema = new Schema({
    _id: Number,
    name: String,
    checked: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
    createDate: {type : Date, default: Date.now},
    username: String
});

todosSchema.pre('save', function(next) {
    var doc = this;
    counters.findByIdAndUpdate({_id: 'todos'}, {$inc: { seq: 1} }, function(error, counter)   {
        if (error) return next(error);
        doc._id = counter.seq;
        next();
    });
});

// the schema is useless so far
// we need to create a model using it
var todo = mongoose.model('todos', todosSchema);

// make this available to our Node applications
module.exports = todo;
