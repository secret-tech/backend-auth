var redis = require('redis');
var Promise = require('bluebird');
var config = require('nconf');
config.file('config.json');
var uuid = require('node-uuid');
var JWT = require('../utils/jwt');
var bcrypt = require('bcrypt-nodejs');
var EXPIRATION_TIME = config.get( 'key_service:expires_seconds');

var sessionKey = function(userId, deviceId, issuedAt) {
  return userId + deviceId + issuedAt;
};

Promise.promisifyAll(redis.RedisClient.prototype);

function KeyService() {
  this.client = redis.createClient(config.get('redis:port'),
                                   config.get('redis:host'));
}

// Retrieve a JWT user key
KeyService.prototype.get = function(sessionKey) {
  return this.client.getAsync(sessionKey);
};

// Generate and store a new JWT user key
KeyService.prototype.set = function(user, deviceId) {
  var userKey = uuid.v4();
  var issuedAt = new Date().getTime();
  var expiresAt = issuedAt + (EXPIRATION_TIME * 1000);

  var token = JWT.generate(user, deviceId, userKey, issuedAt, expiresAt);
  var key = sessionKey(user.id, deviceId, issuedAt);

  var setKey = this.client.setAsync(key, userKey);
  var setExpiration = setKey.then(this.client.expireAsync(key,
                                  EXPIRATION_TIME));
  var getToken = setExpiration.then(function() {
    return token;
  });

  return getToken;
};

// Manually remove a JWT user key
KeyService.prototype.delete = function(sessionKey) {
  return this.client.delAsync(sessionKey);
};

module.exports = new KeyService();