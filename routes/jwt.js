var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var JWT = require('../utils/jwt');
var uuid = require('node-uuid');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var KeyService = require('../services/KeyService');

var config = require('nconf');
config.file('config.json');
var EXPIRATION_TIME = config.get('jwt:expiration');
var redis = require('redis');
var redisClient = redis.createClient(config.get("redis:port"), config.get("redis:host"));

/**
 * POST login
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var params [description]
 * @return {[type]}       [description]
 */
router.post('/', function(req, res, next) {
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

/**
 * DELETE
 * Perform logout action
 * 
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var sessionKey [description]
 * @return {[type]}       [description]
 */
router.delete('/:sessionKey', function(req, res, next) {
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

/**
 * POST 
 * Verify token
 * 
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {	var        token [description]
 * @return {[type]}       [description]
 */
router.post('/verify', function(req, res, next) {
	var token = req.body.token;
	var decoded = jwt.decode(token);
	res.send(JWT.verify(token, decoded.jti));
});


module.exports = router;