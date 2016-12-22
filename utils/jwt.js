var _ = require('underscore');
var config = require('nconf');
config.file('config.json');
var jsrsasign = require('jsrsasign');
var uuid = require('node-uuid');
var JWT_ENCODING_ALGORITHM = config.get('jwt:algorithm');
var JWT_SECRET_SEPARATOR = config.get('jwt:secret_separator');

function JWT() {
  this.secretKey = config.get('jwt:secret');
}

// Generate a new JWT
JWT.prototype.generate = function(user, deviceId, userKey, issuedAt, expiresAt) {
  if (!user.id || !user.login) {
    throw new Error('user.id and user.login are required parameters');
  }

  var header = {
    alg: JWT_ENCODING_ALGORITHM, typ: 'JWT'
  };
  var payload = {
    login: user.login,
    deviceId: deviceId,
    jti: userKey,
    iat: issuedAt,
    exp: expiresAt
  };
  var secret = this.secret(userKey);
  var token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM,
                         JSON.stringify(header),
                         JSON.stringify(payload),
                         secret);
  return token;
};

// Token Secret generation
JWT.prototype.secret = function(userKey) {
  return this.secretKey + JWT_SECRET_SEPARATOR + userKey;
};

JWT.prototype.verify = function(token, userKey) {
  var secret = this.secret(userKey);
  var verificationOpts = {
	alg: [JWT_ENCODING_ALGORITHM],
	verifyAt: new Date().getTime()
    };
  var isValid = jsrsasign.jws.JWS.verifyJWT(token, secret, verificationOpts);

  return isValid;
};


module.exports = new JWT();