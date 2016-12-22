import _ from 'underscore'
import config from '../config'
import jsrsasign from 'jsrsasign'
import uuid from 'node-uuid'

const {
  jwt: { algorithm: JWT_ENCODING_ALGORITHM, secret_separator: JWT_SECRET_SEPARATOR, secret }
} = config

export default {
  secret,

  generate(user, deviceId, userKey, issuedAt, expiresAt) {
    if (!user.id || !user.login) {
      throw new Error('user.id and user.login are required parameters');
    }

    const header = {
      alg: JWT_ENCODING_ALGORITHM,
      typ: 'JWT'
    }

    const payload = {
      login: user.login,
      deviceId,
      jti: userKey,
      iat: issuedAt,
      exp: expiresAt
    }

    const secret = this.secret(userKey)
    const token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM,
                           JSON.stringify(header),
                           JSON.stringify(payload),
                           secret)
    return token
  },

  secret(userKey){
    return this.secretKey + JWT_SECRET_SEPARATOR + userKey
  },

  verify(token, userKey) {
    const secret = this.secret(userKey);
    const verificationOpts = {
    	alg: [JWT_ENCODING_ALGORITHM],
    	verifyAt: new Date().getTime()
    }
    const isValid = jsrsasign.jws.JWS.verifyJWT(token, secret, verificationOpts);

    return isValid;
  }
}
