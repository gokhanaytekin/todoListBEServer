let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let config = require('./config');

mongoose.connect(config.mongoUrl, {
    //useMongoClient: true,
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
console.log("Connected correctly to server");
});

let routes = require('./routes/index');

let userRouter = require('./routes/userRouter');
let todosRouter = require('./routes/todosRouter');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public

app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(cookieParser());

// passport config
let User = require('./models/users');

app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './public/')));

app.use(function(req, res, next) {
    res.header('X-XSS-Protection', 0);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token, appVersion, userid, deviceid');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', "POST, GET, DELETE, PUT, OPTIONS");
    next();
});

app.use('/', routes);

app.use('/users', userRouter);
app.use('/todo', todosRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


// Secure traffic only
app.all('*', function(req, res, next){
    console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
  if (req.secure) {
    return next();
  };

 res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
});

module.exports = app;