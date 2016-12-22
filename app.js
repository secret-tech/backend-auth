var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var jwtRoutes = require('./routes/jwt');
var sessionRoutes = require('./routes/sessions');
var userRoutes = require('./routes/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', jwtRoutes); //Auth routes
app.use('/session', sessionRoutes); //Session routes
app.use('/user', userRoutes); //User routes

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(res.locals);
});

module.exports = app;
