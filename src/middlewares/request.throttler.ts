import { Response, Request, NextFunction } from 'express'
import * as redis from 'redis'
import RateLimiter = require('rolling-rate-limiter')
import config from '../config'

const { throttler: { prefix, interval, maxInInterval, minDifference, whiteList } } = config

const defaultOptions = {
  namespace: prefix,
  interval: interval,
  maxInInterval: maxInInterval,
  minDifference: minDifference,
  whiteList: whiteList
}

export class RequestThrottler {
  limiter: RateLimiter
  whiteList: Array<string>

  /**
   * constructor
   *
   * @param options
   */
  constructor(options?) {
    const { redis: { port, host } } = config
    const redisClient = redis.createClient(port, host)

    if (!options) {
      options = defaultOptions
    }

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
