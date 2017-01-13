"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var bodyParser = require("body-parser");
var jwt_1 = require("./routes/jwt");
var sessions_1 = require("./routes/sessions");
var users_1 = require("./routes/users");
var StatusError = (function (_super) {
    __extends(StatusError, _super);
    function StatusError(msg, status) {
        var _this = _super.call(this, msg) || this;
        _this.status = status;
        return _this;
    }
    return StatusError;
}(Error));
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/auth', jwt_1["default"]); //Auth routes
app.use('/session', sessions_1["default"]); //Session routes
app.use('/user', users_1["default"]); //User routes
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new StatusError('Not Found', 404);
    next(err);
});
// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.json(res.locals);
});
exports.__esModule = true;
exports["default"] = app;
