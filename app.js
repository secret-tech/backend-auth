const EXPIRATION_TIME = 60;

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis');
var redisClient = redis.createClient(6379, '127.0.0.1');
var Promise = require('bluebird');
var KeyService = require('./services/KeyService');
var config = require('nconf');
var uuid = require('node-uuid');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');
var app = express();

var JWT = require('./utils/jwt');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);

router.post('/testUser', function(req, res, next) {
	var params = _.pick(req.body, 'email', 'company', 'password');
	if (!params.email || !params.password) {
		return res.status(400).send(
			{
				error: 'email and password are required parameters',
		        status: 400
		    }
		);
	}
	var password = bcrypt.hashSync(params.password);
	redisClient.set(params.company+':'+params.email, JSON.stringify({
		id: uuid.v4(),
		login: params.company + ':' + params.email,
		password: password,
		email: params.email,
		company: params.company,
	}), function(err, reply) {
		res.json(reply);
	});

});

router.post('/sessions', function(req, res, next) {
  var params = _.pick(req.body, 'login', 'password', 'deviceId');
  if (!params.login || !params.password || !params.deviceId) {
    return res.status(400).send(
    	{
    		error: 'login, password and deviceId' +
                                'are required parameters',
            status: 400
        }
    );
  }

  var user = new Promise(function(resolve, reject) {
  		redisClient.get(params.login, function(err, response) {
  			if (err) {
  				reject(err);
  			} else {
  				resolve(JSON.parse(response));
  			}
  		});
  });

  var passwordMatch = user.then(function(userResult) {
    if (_.isNull(userResult)) {
      return res.status(404).send({
      	error: 'User does not exist',
      	status: 404
      });
    }
    return bcrypt.compareSync(params.password, userResult.password);
  });

  Promise.join(user, passwordMatch, function(userResult, passwordMatchResult) {
    if (!passwordMatchResult) {
      return res.status(403).send({
        error: 'Incorrect password',
        status: 403
      });
    }

	  var userKey = uuid.v4();
	  var issuedAt = new Date().getTime();
	  var expiresAt = issuedAt + (EXPIRATION_TIME * 1000);

	  var token = JWT.generate(userResult, issuedAt, expiresAt);

	  return KeyService.set(userResult, params.deviceId)
        .then(function(token) {
          res.status(200).send({
            accessToken: token
          });
        });
  })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});


// Get Session
router.get('/sessions/:sessionKey', function(req, res, next) {
  var sessionKey = req.params.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameters'});
  }

  KeyService.get(sessionKey)
    .then(function(result) {
      if (_.isNull(result)) {
        return res.status(404).send({error: 'Session does not exist or has ' +
                                    'expired. Please sign in to continue.'});
      }
      res.status(200).send({userKey: result});
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});


// Logout
router.delete('/sessions/:sessionKey', function(req, res, next) {
  var sessionKey = req.params.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameter'});
  }

  KeyService.delete(sessionKey)
    .then(function(result) {
      if (!result) {
        return res.status(404).send();
      }
      res.status(204).send();
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});

router.post('/verify', function(req, res, next) {
	var token = req.body.token;
	var decoded = jwt.decode(token);
	console.log(decoded.jti);
	res.send(JWT.verify(token, decoded.jti));
});


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
