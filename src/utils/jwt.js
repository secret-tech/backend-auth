import config from '../config'
import jwt from 'jsonwebtoken'
import KeyService from '../services/KeyService'

const {
  jwt: { algorithm: JWT_ENCODING_ALGORITHM, secret_separator: JWT_SECRET_SEPARATOR, secret }
} = config

export default {
  secretKey: secret,

  generate(user, deviceId, sessionKey, userKey, issuedAt, expiresIn) {
    const { id, login, scope } = user

    if (!id || !login) {
      throw new Error('user.id and user.login are required parameters');
    }

    const payload = {
      login,
      scope,
      deviceId,
      jti: sessionKey,
      iat: issuedAt
    }

    const secret = this.secret(userKey)
    const token = jwt.sign(payload, secret, {algorithm: JWT_ENCODING_ALGORITHM, expiresIn})

    return token
  },

  secret(userKey){
    return this.secretKey + JWT_SECRET_SEPARATOR + userKey
  },

  async verify(token) {
    const decoded = jwt.decode(token)

    if(!decoded){
      return false
    }

    const userKey = await KeyService.get(decoded.jti)
    const secret = this.secret(userKey)

    try {
      jwt.verify(token, secret, {algorithms: [JWT_ENCODING_ALGORITHM]})
      return true
    } catch(e) {
      return false
    }
  }
}
