import * as express from 'express'
import * as bodyParser from 'body-parser'

import jwtRoutes from './routes/jwt'
import sessionRoutes from './routes/sessions'
import userRoutes from './routes/users'

class StatusError extends Error{
  status: number

  constructor(msg: string, status: number) {
    super(msg)
    this.status = status;
  }
}

const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/auth', jwtRoutes) //Auth routes
app.use('/session', sessionRoutes) //Session routes
app.use('/user', userRoutes) //User routes

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const err: StatusError = new StatusError('Not Found', 404)
  next(err)
})

// error handler
app.use((err: StatusError, req: express.Request, res: express.Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(res.locals)
})

export default app
