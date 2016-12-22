var redis = require('redis');
var Promise = require('bluebird');
var config = require('nconf');
config.file('config.json');
var uuid = require('node-uuid');
var _ = require('underscore');

Promise.promisifyAll(redis.RedisClient.prototype);

function UserService() {
  this.client = redis.createClient(config.get('redis:port'),
                                   config.get('redis:host'));
}

// Retrieve a user by it's login
UserService.prototype.get = function(login) {
  return this.client.getAsync(login);
};

UserService.prototype.create = function(userData) {
	var params = _.pick(userData, 'email', 'company', 'password');
	if (!params.email || !params.password) {
		return false;
	}
	var password = bcrypt.hashSync(params.password);
	var createUser = redisClient.setAsync(params.company+':'+params.email, JSON.stringify({
		id: uuid.v4(),
		login: params.company + ':' + params.email,
		password: password,
		email: params.email,
		company: params.company,
	});
	
	createUser.then(function(err, response) {

	});
}