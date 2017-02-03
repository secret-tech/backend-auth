import * as express from 'express'
import { Response, Request, NextFunction, Application } from 'express'
import * as bodyParser from 'body-parser'

import jwtRoutes from './routes/jwt'
import sessionRoutes from './routes/sessions'
import userRoutes from './routes/users'

class StatusError extends Error {
  status: number;

  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Routes
 */
app.use('/auth', jwtRoutes);
app.use('/session', sessionRoutes);
app.use('/user', userRoutes);

/**
 * Catch 404 and forward to error handler
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: StatusError = new StatusError('Not Found', 404);
  next(err)
});

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
