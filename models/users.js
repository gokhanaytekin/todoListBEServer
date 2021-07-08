// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var counters = require('../models/counters');

// create a schema
var userSchema = new Schema({
    _id: Number,
    code: String,
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    desc: String,
    sex: String,
    title: String,
    email: String,
    address: String,
    town: String,
    city: String,
    salt: String,
    hash: String,
    username: String,
    deviceToken: String,
    createDate: {type : Date, default : Date.now}
});

userSchema.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

userSchema.pre('save', function(next) {
    var doc = this;
    counters.findByIdAndUpdate({_id: 'users'}, {$inc: { seq: 1} }, function(error, counter)   {
        if (error) return next(error);
        doc._id = counter.seq;
        next();
    });
});

userSchema.plugin(passportLocalMongoose);

// the schema is useless so far
// we need to create a model using it
var Users = mongoose.model('users', userSchema);

// make this available to our Node applications
module.exports = Users;
