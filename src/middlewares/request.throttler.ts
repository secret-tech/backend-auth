import { Response, Request, NextFunction } from 'express'

import { RedisClient } from 'redis'
import RateLimiter = require('rolling-rate-limiter')

export class RequestThrottler {
  limiter: RateLimiter
  whiteList: Array<string>

  /**
   * constructor
   *
   * @param  redisClient  redis client
   * @param options
   */
  constructor(redisClient: RedisClient, options) {
    this.limiter = RateLimiter({
      redis: redisClient,
      ...options
    })
    this.whiteList = options.whiteList
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

    if (this.whiteList.indexOf(ip) !== -1) {
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
