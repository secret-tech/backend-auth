import config from '../config'
import * as jwt from 'jsonwebtoken'
import { injectable } from 'inversify'

const { algorithm, secret_separator, secret, expiration } = config.jwt

type TokenUserData = {
  id: string,
  login: string,
  sub: string
  scope?: any,
}

type TokenTenantData = {
  id: string,
  login: string,
}

export interface JWTServiceInterface {
  generateUserToken: (user: TokenUserData, deviceId: string, sessionKey: string, userKey: string, issuedAt: number, expiresIn?: number) => any
  generateTenantToken: (tenant: TokenTenantData, sessionKey: string, userKey: string, issuedAt: number) => string
  verify: (token: string, userKey: string) => Promise<boolean>
  decode: (token: string) => any
}

/**
 *  JWT service
 */
@injectable()
export class JWTService implements JWTServiceInterface {
  private secret: string
  private algorithm: string
  private secret_separator: string
  /**
   * Creates jwt service instance
   */
  constructor() {
    this.secret = secret
    this.algorithm = algorithm
    this.secret_separator = secret_separator
  }

  /**
   * Generate user's token
   *
   * @param  user       user data object
   * @param  deviceId   device id
   * @param  sessionKey current user's session
   * @param  userKey    user's unique key
   * @param  issuedAt   time of creation
   * @param  expiresIn  expiration time
   * @return  generated token
   */
  generateUserToken(user: TokenUserData, deviceId: string, sessionKey: string, userKey: string, issuedAt: number, expiresIn?: number): any {
    const { id, login, scope, sub } = user

    if (!expiresIn) {
      expiresIn = expiration
    }

    const payload = {
      id,
      login,
      scope,
      deviceId,
      jti: sessionKey,
      iat: issuedAt,
      sub,
      aud: 'jincor.com'
    }

    const secret = this.generateSecret(userKey)
    const token = jwt.sign(payload, secret, {algorithm: this.algorithm, expiresIn})
    return { token, expiresIn }
  }


  /**
   * Generate tenant's token
   *
   * @param  tenant      user data object
   * @param  sessionKey current user's session
   * @param  userKey    user's unique key
   * @param  issuedAt   time of creation
   * @return  generated token
   */
  generateTenantToken(tenant: TokenTenantData, sessionKey: string, userKey: string, issuedAt: number): string {
    const { id, login, } = tenant

    const payload = {
      id,
      login,
      jti: sessionKey,
      iat: issuedAt,
      aud: 'jincor.com',
      isTenant: true
    }

    const secret = this.generateSecret(userKey)

    return jwt.sign(payload, secret, {algorithm: this.algorithm})
  }


  /**
   * Verify token
   *
   * @param  token  user's token
   * @param  userKey  user's session key
   * @return  promise
   */
  async verify(token: string, userKey: string): Promise<boolean> {
    const secret = this.generateSecret(userKey)

    try {
      jwt.verify(token, secret, {algorithms: [this.algorithm]})
      return true
    } catch (e) {
      return false
    }
  }

  decode(token: string): any {
    return jwt.decode(token)
  }


  /**
   * Generate secret key
   *
   * @param  userKey  unique user's key
   * @return generated secret
   */
  private generateSecret(userKey: string): string {
    return this.secret + this.secret_separator + userKey
  }
}

const JWTServiceType = Symbol('JWTServiceInterface')
export { JWTServiceType }
