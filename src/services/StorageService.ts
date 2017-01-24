import { RedisClient } from 'redis'
import * as redis from 'redis'
import * as Bluebird from 'bluebird'
Promise = require('bluebird')

import config from '../config'

const {redis: {port, host}} = config

export interface StorageService {
  redis: RedisClient
  set: (key: string, value: string) => Promise<string>
  get: (key: string) => Promise<string>
  expire: (key: string, time: number) => Promise<any>
  del: (key: string) => Promise<any>
}

const redisClient: StorageService = {
  redis: redis.createClient(port, host),
  set: Bluebird.promisify<string, string, string>(this.redis.set),
  get: Bluebird.promisify<string, string>(this.redis.get),
  expire: Bluebird.promisify<any, string, number>(this.redis.expire),
  del: Bluebird.promisify<any, string>(this.redis.del)
}

export default redisClient
