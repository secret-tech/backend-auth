import storage, { StorageService } from './storage.service'
import * as uuid from 'node-uuid'

import JWT from './jwt.service'
import config from '../config'


const { expires_seconds: EXPIRATION_TIME } = config.key_service


/**
 * KeyService
 */
export class KeyService {

  /**
   * constructor
   *
   * @param  client  redis client
   */
  constructor(private client: StorageService) {}


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
    const token = JWT.generate(user, deviceId, key, userKey, issuedAt, EXPIRATION_TIME)

    await this.client.set(key, userKey)
    await this.client.expire(key, EXPIRATION_TIME)

    return token
  }


  /**
   * Delete user's key
   *
   * @param  key  session id
   * @return      Promise
   */
  delete(key: string): Promise<any> {
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
}

export default new KeyService(storage)
