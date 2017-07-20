import { StorageService, StorageServiceType } from './storage.service'
import * as uuid from 'node-uuid'
import * as jwt from 'jsonwebtoken'
import config from '../config'
import {inject, injectable} from 'inversify'
import 'reflect-metadata'
const { algorithm, secret_separator, secret } = config.jwt

const { expires_seconds: EXPIRATION_TIME } = config.key_service

export interface KeyServiceInterface {
  get: (key: string) => Promise<string>
  set: (user: any, deviceId: string) => Promise<string>
  setTenantToken: (tenant: any) => Promise<string>
  del: (key: string) => Promise<any>
}

/**
 * KeyService
 */
@injectable()
export class KeyService implements KeyServiceInterface {
  /**
   * constructor
   *
   * @param  client  redis client
   */
  constructor(
    @inject(StorageServiceType) private client: StorageService,
  ) { }


  /**
   * Returns user's key
   *
   * @param  key      session key
   * @return          Promise
   */
  get(key: string): Promise<string> {
    return this.client.get(key)
  }


  /**
   * Generate and set user's key
   *
   * @param  user       user's data
   * @param  deviceId   device id
   * @return            Promise
   */
  async set(user: any, deviceId: string): Promise<string> {
    const userKey = uuid.v4()
    const issuedAt = Date.now()

    const key = this.sessionKey(user.id, deviceId, issuedAt)
    const token = this.generate(user, deviceId, key, userKey, issuedAt, EXPIRATION_TIME)

    await this.client.set(key, userKey)
    await this.client.expire(key, EXPIRATION_TIME)

    return token
  }

  /**
   * Generate and set tenant key
   *
   * @param  tenant       tenant's data
   * @return            Promise
   */
  async setTenantToken(tenant: any): Promise<string> {
    const userKey = uuid.v4()
    const issuedAt = Date.now()

    const key = this.tenantSessionKey(tenant.id, issuedAt)
    const token = this.generateTenant(tenant, key, userKey, issuedAt)

    await this.client.set(key, userKey)

    return token
  }

  /**
   * Delete user's key
   *
   * @param  key  session id
   * @return      Promise
   */
  del(key: string): Promise<any> {
    return this.client.del(key)
  }


  /**
   * Generate session key
   *
   * @param  userId    user id
   * @param  deviceId  device id
   * @param  issuedAt  creation time
   * @return           session key
   */
  private sessionKey(userId: string, deviceId: string, issuedAt: number): string {
    return userId + deviceId + issuedAt.toString()
  }

  /**
   * Generate tenant session key
   *
   * @param  userId    user id
   * @param  issuedAt  creation time
   * @return           session key
   */
  private tenantSessionKey(userId: string, issuedAt: number): string {
    return userId + issuedAt.toString()
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

    return jwt.sign(payload, secret, {algorithm: algorithm, expiresIn})
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

    return jwt.sign(payload, secret, {algorithm: algorithm})
  }

  /**
   * Generate secret key
   *
   * @param  userKey  unique user's key
   * @return generated secret
   */
  private generateSecret(userKey: string): string {
    return secret + secret_separator + userKey
  }
}

const KeyServiceType = Symbol('KeyServiceInterface')
export { KeyServiceType }
