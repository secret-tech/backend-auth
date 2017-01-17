import config from '../config'
import * as jwt from 'jsonwebtoken'
import KeyService from '../services/KeyService'

const { algorithm, secret_separator, secret } = config.jwt


export class JWTService {
  private secret: string
  private algorithm: string
  private secret_separator: string

  constructor(secret: string, algorithm: string, secret_separator: string) {
    this.secret = secret
    this.algorithm = algorithm
    this.secret_separator = secret_separator
  }

  generate(user: any, deviceId: string, sessionKey: string, userKey: string, issuedAt: number, expiresIn: number): string{
    const { id, login, scope } = user

    if (!id || !login) {
      throw new Error('user.id and user.login are required parameters');
    }

    const payload = {
      id,
      login,
      scope,
      deviceId,
      jti: sessionKey,
      iat: issuedAt
    }

    const secret = this.generateSecret(userKey)
    const token = jwt.sign(payload, secret, {algorithm: this.algorithm, expiresIn})

    return token
  }

  async verify(token: string): Promise<boolean> {
    const decoded = jwt.decode(token)

    if(!decoded){
      return false
    }

    const userKey = await KeyService.get(decoded.jti)
    const secret = this.generateSecret(userKey)

    try {
      jwt.verify(token, secret, {algorithms: [this.algorithm]})
      return true
    } catch(e) {
      return false
    }
  }

  private generateSecret(userKey: string): string{
    return this.secret + this.secret_separator + userKey
  }
}

export default new JWTService(secret, algorithm, secret_separator)
