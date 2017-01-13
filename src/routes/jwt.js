"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require("express");
var bcrypt = require("bcrypt-nodejs");
var jwt_1 = require("../utils/jwt");
var KeyService_1 = require("../services/KeyService");
var UserService_1 = require("../services/UserService");
var router = express.Router();
/**
 * POST login
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var params [description]
 * @return {[type]}       [description]
 */
router.post('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var _a, login, password, deviceId, userStr, user, passwordMatch, token, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, login = _a.login, password = _a.password, deviceId = _a.deviceId;
                if (!login || !password || !deviceId) {
                    return [2 /*return*/, res.status(400).send({
                            error: 'login, password and deviceId are required parameters',
                            status: 400
                        })];
                }
                return [4 /*yield*/, UserService_1["default"].get(login)];
            case 1:
                userStr = _b.sent();
                if (!userStr) {
                    return [2 /*return*/, res.status(404).send({
                            error: 'User does not exist',
                            status: 404
                        })];
                }
                user = JSON.parse(userStr);
                passwordMatch = bcrypt.compareSync(password, user.password);
                if (!passwordMatch) {
                    return [2 /*return*/, res.status(403).send({
                            error: 'Incorrect password',
                            status: 403
                        })];
                }
                return [4 /*yield*/, KeyService_1["default"].set(user, deviceId)];
            case 2:
                token = _b.sent();
                res.status(200).send({
                    accessToken: token
                });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _b.sent();
                next(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * DELETE
 * Perform logout action
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var sessionKey [description]
 * @return {[type]}       [description]
 */
router["delete"]('/:sessionKey', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var sessionKey, result, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                sessionKey = req.params.sessionKey;
                if (!sessionKey) {
                    return [2 /*return*/, res.status(400).send({
                            error: 'sessionKey is a required parameter'
                        })];
                }
                return [4 /*yield*/, KeyService_1["default"]["delete"](sessionKey)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result
                        ? res.status(204).send()
                        : res.status(404).send()];
            case 2:
                e_2 = _a.sent();
                next(e_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST
 * Verify token
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {	var        token [description]
 * @return {[type]}       [description]
 */
router.post('/verify', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var token, isValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = req.body.token;
                return [4 /*yield*/, jwt_1["default"].verify(token)];
            case 1:
                isValid = _a.sent();
                if (!isValid) {
                    return [2 /*return*/, res.status(400).send({
                            error: 'invalid token'
                        })];
                }
                res.send(isValid);
                return [2 /*return*/];
        }
    });
}); });
exports.__esModule = true;
exports["default"] = router;
