var express = require('express');
var bodyParser = require('body-parser');

var Users = require('../models/users');
var passport = require('passport');
var Verify = require('./verify');



var userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.route('/')

.get(Verify.verifyOrdinaryUserWithAppVersion, function(req,res,next){
    if (req.query.username) {
        req.query.username = req.query.username.toLowerCase();
    }
    Users.find(req.query).sort('_id').exec(function (err, users) {
        if (err) return next(err);
        res.json(users);
    });
})

.post(function(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    Users.create(req.body, function (err, user) {
        if (err) return next(err);
        user.setPassword(req.body.password.toLowerCase(), function() {
            Users.findByIdAndUpdate(user._id, user, function(err, newUserTask) {
                if (err) {
                    return res.status(500).json({err: err});
                }
                return res.status(200).json(user);   
            })
        });
        console.log('user created!');
    });
});

userRouter.route('/:userId')
.get(Verify.verifyOrdinaryUserWithAppVersion, function(req,res,next){
    Users.findById(req.params.userId.toLowerCase(), function (err, user) {
        if (err) return next(err);
        res.json(user);
    });})

.put(Verify.verifyOrdinaryUserWithAppVersion, function(req, res, next){
    if (req.body.username) {
        req.body.username = req.body.username.toLowerCase();
    }
    if (req.body.password) {
        req.body.password = req.body.password.toLowerCase();
    }
    Users.findByIdAndUpdate(req.params.userId.toLowerCase(), {
        $set: req.body
    }, {
        new: true
    }, function (err, user) {
        if (err) return next(err);
        res.json(user);
    });
})

.delete(Verify.verifyOrdinaryUserWithAppVersion, function(req, res, next){
    Users.findByIdAndRemove(req.params.userId.toLowerCase(), function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});


userRouter.route("register").post(function(req, res) {
    Users.register(new Users({ 
            _id : req.body.username.toLowerCase(),
            username : req.body.username.toLowerCase(), 
            firstname : req.body.firstname,
            lastname : req.body.lastname,
    }),
        req.body.password.toLowerCase(), function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        if(req.body.tel) {
            user.tel = req.body.tel;
        }
        if(req.body.tckn) {
            user.tckn = req.body.tckn;
        }
        user.save(function(err,user) {
        passport.authenticate('local')(req, res, function () {
            return res.status(200).json({status: 'Registration Successful!'});        
        });
    });
  });
});


userRouter.route("/setpassword")
.post(Verify.verifyOrdinaryUserWithAppVersion, function(req, res) {
    var username = req.body.username || req.body[0].username;
    Users.findByUsername(username.toLowerCase(), true, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (user) {
            var password = req.body.password || req.body[0].password;
            user.setPassword(password.toLowerCase(), function() {
                Users.findByIdAndUpdate(user._id, user, function(err, newUserTask) {
                    if (err) {
                        return res.status(500).json({err: err});
                    }
                    return res.status(200).json({status: 'Password Successful!'});   
                })
            });
        } else {
            console.log('Değiştiren kullanıcı bulunamadı', JSON.stringify(req.headers), JSON.stringify(req.body), new Date());
            return res.status(500).json({err: 'user does not exist'});
        }
    }, function(err) {
        console.log('Şifre değiştirmek için geçersiz yetki', JSON.stringify(req.headers), JSON.stringify(req.body), new Date());
        return res.status(401).json({err: 'Yetki hatası'});
    })
    
});

userRouter.route("setdevicetoken")
.post(Verify.verifyOrdinaryUserWithAppVersion, function(req, res) {
    Users.findByUsername(req.body.username, true, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (user) {
            user.deviceToken = req.body.token;
            user.save(function(err,user) {
                if (err) {
                    return res.status(500).json({err: err});
                }
                return res.status(200).json({status: 'Device token successful!'});        
            });
        } else {
            res.status(500).json({err: 'User does not exist'});
        }
    }, function(err) {
        return next(err);
    })
});

userRouter.route('/login')
.post(Verify.verifyAppVersion, function(req, res, next) {
    req.body.username = req.body.username.toLowerCase();
    req.body.password = req.body.password.toLowerCase();
    passport.authenticate('local', function(err, user, info) {
        if (err) {
        return next(err);
        }
        if (!user) { 
        return res.status(401).json({
            err: info
        });
        }
        req.logIn(user, function(err) {
        if (err) {
            return res.status(500).json({
            err: 'Could not log in user'
            });
        }
        var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
        res.status(200).json(
        {
            status: 'Login successful!',
            success: true,
            token: token,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id,
            taskTemplates: user.taskTemplates,
            code: user.code
        });
    });
  })(req,res,next);
});

userRouter.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json(
    {
        status: 'Bye!'
    });
});

userRouter.route("/info").get(Verify.verifyOrdinaryUserWithAppVersion, function(req, res) {
    Users.find(req.query, function (err, user) {
        if (err) return next(err);
        res.json(user);
    });
});

module.exports = userRouter;
