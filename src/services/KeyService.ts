import storage, { StorageService } from './StorageService'
import * as uuid from 'node-uuid'

import JWT from '../utils/jwt'
import config from '../config'


const { expires_seconds: EXPIRATION_TIME } = config.key_service

export class KeyService {
  client: StorageService

  constructor(client: StorageService){
    this.client = client
  }

  get(key: string): Promise<string> {
    return this.client.get(key)
  }

  async set(user: any, deviceId: string): Promise<string> {
    const userKey = uuid.v4()
    const issuedAt = Date.now()

    const key = this.sessionKey(user.id, deviceId, issuedAt)
    const token = JWT.generate(user, deviceId, key, userKey, issuedAt, EXPIRATION_TIME)

    await this.client.set(key, userKey)
    await this.client.expire(key, EXPIRATION_TIME)

    return token
  }

  delete(key: string): Promise<any> {
    return this.client.del(key)
  }

  private sessionKey(userId: string, deviceId: string, issuedAt: number): string {
    return userId + deviceId + issuedAt.toString()
  }
}

export default new KeyService(storage)
