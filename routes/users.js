var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var redis = require('redis');
var redisClient = redis.createClient(6379, 'redis');
var uuid = require('node-uuid');
var _ = require('underscore');

/**
 * POST create user
 *
 * TODO: check if this route were called only
 * from our's server(USE JWT for this as well?)
 *
 * Create new user in Redis storage
 * Throw an error if user already exists in DB
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {}          [description]
 * @return {[type]}       [description]
 */
router.post('/', function(req, res, next) {
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

module.exports = router;
