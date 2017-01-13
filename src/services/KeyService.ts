import * as redis from 'redis'
import * as bluebird from 'bluebird'
import * as uuid from 'node-uuid'

import config from '../config'
import JWT from '../utils/jwt'

const {
  redis: { port, host },
  key_service: { expires_seconds: EXPIRATION_TIME }
} = config

const client: any = bluebird.promisifyAll(redis.createClient(port, host))
const sessionKey = (userId, deviceId, issuedAt) => userId + deviceId + issuedAt

const KeyService = {
  // Redis client
  client,

  // Retrieve a JWT user key
  get(sessionKey) {
    return this.client.getAsync(sessionKey)
  },

  // Generate and store a new JWT user key
  async set(user, deviceId) {
    const userKey = uuid.v4()
    const issuedAt = Date.now()

    const key = sessionKey(user.id, deviceId, issuedAt)
    const token = JWT.generate(user, deviceId, key, userKey, issuedAt, EXPIRATION_TIME)

    await client.setAsync(key, userKey)
    await client.expireAsync(key, EXPIRATION_TIME)

    return token
  },

  // Manually remove a JWT user key
  delete(sessionKey) {
    return client.delAsync(sessionKey)
  }
}

export default KeyService
