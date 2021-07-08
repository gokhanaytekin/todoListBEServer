var express = require('express');
var bodyParser = require('body-parser');
var Counters = require('../models/counters');
var Verify = require('./verify');


var countRouter = express.Router();
countRouter.use(bodyParser.json());

countRouter.route('/')

.get(Verify.verifyOrdinaryUserWithAppVersion, function(req,res,next){
    Counters.find(req.query).sort('_id').exec(function (err, cnt) {
        if (err) return next(err);
        res.json(cnt);
    });
    
})

.post(Verify.verifyOrdinaryUserWithAppVersion, function(req, res, next){
    Counters.create(req.body, (err, newCnt) => {
        if(err) {
            console.log(err);
        }
        res.json(newCnt)
    })
});

module.exports = countRouter;
