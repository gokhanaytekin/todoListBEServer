// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = new Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counters = mongoose.model('counter', CounterSchema);

// make this available to our Node applications
module.exports = counters;
