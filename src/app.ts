import * as express from 'express'
import { Response, Request, NextFunction, Application } from 'express'
import * as bodyParser from 'body-parser'
import { RequestThrottler } from './middlewares/request.throttler'
import config from './config'
import * as redis from 'redis'

import jwtRoutes from './routes/jwt'
import userRoutes from './routes/users'
import tenantRoutes from './routes/tenant'

const app: Application = express()

app.disable('x-powered-by')

app.use((req: Request, res: Response, next: NextFunction) => {
  if (config.app.forceHttps === 'enabled') {
    if (!req.secure) {
      return res.redirect('https://' + req.hostname + ':' + config.app.httpsPort + req.originalUrl)
    }

    res.setHeader('Strict-Transport-Security', 'max-age=31536000')
  }

  if (req.header('Accept') !== 'application/json') {
    return res.status(406).json({
      error: 'Unsupported "Accept" header',
    })
  }

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'deny')
  res.setHeader('Content-Security-Policy', 'default-src \'none\'')
  return next()
})

app.post('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.header('Content-Type') !== 'application/json') {
    return res.status(406).json({
      error: 'Unsupported "Content-Type"',
    })
  }

  return next()
})

const { throttler: { prefix, interval, maxInInterval, minDifference, whiteList } } = config
const { redis: { port, host } } = config

const redisClient = redis.createClient(port, host)

const options = {
  namespace: prefix,
  interval: interval,
  maxInInterval: maxInInterval,
  minDifference: minDifference,
  whiteList: whiteList
}

const requestThrottler = new RequestThrottler(redisClient, options)

app.use((req: Request, res: Response, next: NextFunction) => requestThrottler.throttle(req, res, next))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

/**
 * Routes
 */
app.use('/auth', jwtRoutes)
app.use('/user', userRoutes)
app.use('/tenant', tenantRoutes)

/**
 * Respond with 404 if route was not found
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).send('Not found')
})

/**
 * Error handler
 */
app.use((err: Error, req: Request, res: Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.json(res.locals)
})

export default app
