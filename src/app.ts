import * as express from 'express'
import { Response, Request, NextFunction, Application } from 'express'
import * as bodyParser from 'body-parser'
import requestThrottler from './middlewares/request.throttler'

import jwtRoutes from './routes/jwt'
import userRoutes from './routes/users'

class StatusError extends Error {
  status: number

  constructor(msg: string, status: number) {
    super(msg)
    this.status = status
  }
}

const app: Application = express()

app.disable('x-powered-by')

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.header('Accept') !== 'application/json') {
    res.status(406).send('There is no "Accept: application/json" header')
  }

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'deny')
  res.setHeader('Content-Security-Policy', 'default-src \'none\'')
  next()
})

app.post('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.header('Content-Type') !== 'application/json') {
    res.status(406).send('There is no "Content-Type: application/json" header')
  }

  next()
})

app.use((req: Request, res: Response, next: NextFunction) => requestThrottler.throttle(req, res, next))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

/**
 * Routes
 */
app.use('/auth', jwtRoutes)
app.use('/user', userRoutes)

/**
 * Respond with 404 if route was not found
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send('Not found')
})

/**
 * Error handler
 */
app.use((err: StatusError, req: Request, res: Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(res.locals)
})

export default app
