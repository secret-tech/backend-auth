import express from 'express'
import bodyParser from 'body-parser'

import jwtRoutes from './routes/jwt'
import sessionRoutes from './routes/sessions'
import userRoutes from './routes/users'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/auth', jwtRoutes) //Auth routes
app.use('/session', sessionRoutes) //Session routes
app.use('/user', userRoutes) //User routes

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(res.locals)
});

export default app
