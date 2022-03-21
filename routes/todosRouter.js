var express = require('express');
var bodyParser = require('body-parser');
var Todos = require('../models/todos');
var Verify = require('./verify');


var todosRouter = express.Router();
todosRouter.use(bodyParser.json());

todosRouter.route('/')

.get(function(req,res,next){
    Todos.find(req.query).sort('_id').exec(function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
})

.post(function(req, res, next){
    Todos.create(req.body, (err, newTodo) => {
        if(err) {
            console.log(err);
        }
        res.json(newTodo)
    })
});

todosRouter.route('/getAll')

.post(function(req, res, next){
    Todos.find(req.body).sort('_id').exec(function (err, todo) {
        if (err) return next(err);
        res.json(todo);
    });
});

todosRouter.route('/update')

.post(function(req, res, next){
    Todos.findByIdAndUpdate((req.body._id), req.body.data, (err, changedTodo) => {
        if(err) {
            console.log(err);
        }
        res.json(changedTodo)
    })
});

module.exports = todosRouter;
