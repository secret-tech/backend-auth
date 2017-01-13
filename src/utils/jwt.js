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
var config_1 = require("../config");
var jwt = require("jsonwebtoken");
var KeyService_1 = require("../services/KeyService");
var _a = config_1["default"].jwt, JWT_ENCODING_ALGORITHM = _a.algorithm, JWT_SECRET_SEPARATOR = _a.secret_separator, secret = _a.secret;
exports.__esModule = true;
exports["default"] = {
    secretKey: secret,
    generate: function (user, deviceId, sessionKey, userKey, issuedAt, expiresIn) {
        var id = user.id, login = user.login, scope = user.scope;
        if (!id || !login) {
            throw new Error('user.id and user.login are required parameters');
        }
        var payload = {
            id: id,
            login: login,
            scope: scope,
            deviceId: deviceId,
            jti: sessionKey,
            iat: issuedAt
        };
        var secret = this.secret(userKey);
        var token = jwt.sign(payload, secret, { algorithm: JWT_ENCODING_ALGORITHM, expiresIn: expiresIn });
        return token;
    },
    secret: function (userKey) {
        return this.secretKey + JWT_SECRET_SEPARATOR + userKey;
    },
    verify: function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, userKey, secret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        decoded = jwt.decode(token);
                        if (!decoded) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, KeyService_1["default"].get(decoded.jti)];
                    case 1:
                        userKey = _a.sent();
                        secret = this.secret(userKey);
                        try {
                            jwt.verify(token, secret, { algorithms: [JWT_ENCODING_ALGORITHM] });
                            return [2 /*return*/, true];
                        }
                        catch (e) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
};
