"use strict";
var _a = process.env, REDIS_HOST = _a.REDIS_HOST, REDIS_PORT = _a.REDIS_PORT, PORT = _a.PORT;
exports.__esModule = true;
exports["default"] = {
    app: {
        port: parseInt(PORT, 10) || 3000
    },
    key_service: {
        expires_seconds: 604800
    },
    jwt: {
        algorithm: "HS256",
        secret_separator: ":",
        expiration: 60,
        secret: "uZrJ!xe*xN?!;oU.u*;QOSM+|=4C?WH?6eWPcK/6AkIXIVGQguSA*r"
    },
    redis: {
        port: parseInt(REDIS_PORT, 10) || 6379,
        host: REDIS_HOST || "localhost"
    }
};
