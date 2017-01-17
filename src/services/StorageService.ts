import { RedisClient } from 'redis'
import * as redis from 'redis'
import * as Promise from 'bluebird'
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
  set: Promise.promisify<string, string, string>(this.redis.set),
  get: Promise.promisify<string, string>(this.redis.get),
  expire: Promise.promisify<any, string, number>(this.redis.expire),
  del: Promise.promisify<any, string>(this.redis.del)
}

export default redisClient
