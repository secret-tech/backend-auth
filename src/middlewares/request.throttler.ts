import * as redis from 'redis'
import { Response, Request, NextFunction } from 'express'

import config from '../config'
import { RedisClient } from 'redis'
import RateLimiter = require('rolling-rate-limiter')

const {throttler: {prefix, interval, maxInInterval, minDifference, whiteList}} = config

export class RequestThrottler {
  limiter: RateLimiter

  /**
   * constructor
   *
   * @param  redisClient  redis client
   */
  constructor(redisClient: RedisClient) {
    this.limiter = RateLimiter({
      redis: redisClient,
      namespace: prefix,
      interval: interval,
      maxInInterval: maxInInterval,
      minDifference: minDifference,
    })
  }

  throttle(req: Request, res: Response, next: NextFunction) {
    let ip = req.ip

    /*
     Check if IP has ipv6 prefix and remove it.
     See: https://stackoverflow.com/questions/29411551/express-js-req-ip-is-returning-ffff127-0-0-1
     */
    if (ip.substr(0, 7) === '::ffff:') {
      ip = ip.substr(7)
    }

    if (whiteList.indexOf(ip) !== -1) {
      return next()
    }

    this.limiter(ip, (err, timeLeft) => {
      if (err) {
        return res.status(500).send()
      } else if (timeLeft) {
        return res.status(429).send('You must wait ' + timeLeft + ' ms before you can make requests.')
      } else {
        return next()
      }
    })
  }
}

const {redis: {port, host}} = config

const redisClient = redis.createClient(port, host)

export default new RequestThrottler(redisClient)