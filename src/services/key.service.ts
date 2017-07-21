import { StorageService, StorageServiceType } from './storage.service'
import * as uuid from 'node-uuid'
import { inject, injectable } from 'inversify'
import { JWTServiceType, JWTServiceInterface } from './jwt.service'

export interface KeyServiceInterface {
  get: (key: string) => Promise<string>
  set: (user: any, deviceId: string) => Promise<string>
  setTenantToken: (tenant: any) => Promise<string>
  del: (key: string) => Promise<any>
  verifyToken: (token: string) => Promise<any>
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
   * @param  jwtService JWT service
   */
  constructor(
    @inject(StorageServiceType) private client: StorageService,
    @inject(JWTServiceType) private jwtService: JWTServiceInterface,
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
    const { token, expiresIn } = this.jwtService.generateUserToken(user, deviceId, key, userKey, issuedAt)

    await this.client.set(key, userKey)
    await this.client.expire(key, expiresIn)

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
    const token = this.jwtService.generateTenantToken(tenant, key, userKey, issuedAt)

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

  async verifyToken(token: string): Promise<any> {
    const decoded = this.jwtService.decode(token)

    if (!decoded) {
      return { valid: false }
    }

    const userKey = await this.get(decoded.jti)
    const valid = await this.jwtService.verify(token, userKey)
    return { valid, decoded }
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
}

const KeyServiceType = Symbol('KeyServiceInterface')
export { KeyServiceType }
