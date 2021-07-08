// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var counters = require('./counters');


// create a schema
let logsSchema = new Schema({
    _id: {type: Number, auto: true},
    logUnit: String,
    desc: String,
    descObject: Object,
    error: String,
    errorObject: Object,
    userId: String,
    operation: String,
    createDate: {type : Date, default : Date.now}
});

logsSchema.pre('save', function(next) {
    var doc = this;
    counters.findByIdAndUpdate({_id: 'logs'}, {$inc: { seq: 1} }, function(error, counter)   {
        if (error) return next(error);
        doc._id = counter.seq;
        next();
    });
});


// the schema is useless so far
// we need to create a model using it
let Logs = mongoose.model('logs', logsSchema);

// make this available to our Node applications
module.exports = Logs;
