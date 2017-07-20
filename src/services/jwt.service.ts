import config from '../config'
import * as jwt from 'jsonwebtoken'
import { KeyServiceInterface, KeyServiceType } from './key.service'
import { injectable, inject } from 'inversify'
import 'reflect-metadata'

const { algorithm, secret_separator, secret } = config.jwt

export interface JWTServiceInterface {
  generate: (user: any, deviceId: string, sessionKey: string, userKey: string, issuedAt: number, expiresIn: number) => string
  generateTenant: (tenant: any, sessionKey: string, userKey: string, issuedAt: number) => string
  verify: (token: string) => Promise<boolean>
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
  private keyService: KeyServiceInterface
  /**
   * Creates jwt service instance
   *
   * @param  keyService
   */
  constructor(@inject(KeyServiceType) keyService: KeyServiceInterface) {
    this.secret = secret
    this.algorithm = algorithm
    this.secret_separator = secret_separator
    this.keyService = keyService
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
  generate(user: any, deviceId: string, sessionKey: string, userKey: string, issuedAt: number, expiresIn: number): string {
    const { id, login, scope, sub } = user

    if (!id || !login || !sub) {
      throw new Error('user.id and user.login are required parameters')
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

    return jwt.sign(payload, secret, {algorithm: this.algorithm, expiresIn})
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
  generateTenant(tenant: any, sessionKey: string, userKey: string, issuedAt: number): string {
    const { id, login, } = tenant

    if (!id || !login) {
      throw new Error('tenant id and tenant login are required parameters')
    }

    const payload = {
      id,
      login,
      jti: sessionKey,
      iat: issuedAt,
      aud: 'jincor.com'
    }

    const secret = this.generateSecret(userKey)

    return jwt.sign(payload, secret, {algorithm: this.algorithm})
  }


  /**
   * Verify token
   *
   * @param  token  user's token
   * @return  promise
   */
  async verify(token: string): Promise<boolean> {
    const decoded = jwt.decode(token)

    if (!decoded) {
      return false
    }

    const userKey = await this.keyService.get(decoded.jti)
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
