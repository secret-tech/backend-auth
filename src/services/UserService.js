"use strict";
var redis = require("redis");
var bluebird = require("bluebird");
var uuid = require("node-uuid");
var bcrypt = require("bcrypt-nodejs");
var config_1 = require("../config");
var _a = config_1["default"].redis, port = _a.port, host = _a.host;
var client = bluebird.promisifyAll(redis.createClient(port, host));
var UserService = {
    // Redis client
    client: client,
    // Retrieve a user by it's login
    get: function (login) {
        return client.getAsync(login);
    },
    // Create new user
    create: function (userData) {
        var email = userData.email, company = userData.company, password = userData.password, scope = userData.scope;
        if (!email || !password) {
            throw new Error('email and password are required parameters');
        }
        var pwd = bcrypt.hashSync(password);
        var login = company + ":" + email;
        return client.setAsync(login, JSON.stringify({
            id: uuid.v4(),
            login: login,
            password: pwd,
            email: email,
            company: company,
            scope: scope
        }));
    }
};
exports.__esModule = true;
exports["default"] = UserService;
