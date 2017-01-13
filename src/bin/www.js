"use strict";
var app_1 = require("../app");
var http = require("http");
var config_1 = require("../config");
/**
 * Get port from environment and store in Express.
 */
app_1["default"].set('port', config_1["default"].app.port);
/**
 * Create HTTP server.
 */
var server = http.createServer(app_1["default"]);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(config_1["default"].app.port);
