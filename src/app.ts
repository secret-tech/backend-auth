import 'reflect-metadata';
import * as express from 'express';
import { Response, Request, NextFunction, Application } from 'express';
import * as bodyParser from 'body-parser';
import { RequestThrottler } from './middlewares/request.throttler';
import config from './config';

import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './ioc.container';

const app: Application = express();

app.disable('x-powered-by');

app.use((req: Request, res: Response, next: NextFunction) => {
  if (config.app.forceHttps === 'enabled') {
    if (!req.secure) {
      return res.redirect('https://' + req.hostname + ':' + config.app.httpsPort + req.originalUrl);
    }

    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'deny');
    res.setHeader('Content-Security-Policy', 'default-src \'none\'');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');

    if ('OPTIONS' === req.method) {
      //respond with 200
      return res.sendStatus(200);
    }

  if (req.header('Accept') !== 'application/json') {
    return res.status(406).json({
      error: 'Unsupported "Accept" header'
    });
  }

  return next();
});

app.post('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.header('Content-Type') !== 'application/json') {
    return res.status(406).json({
      error: 'Unsupported "Content-Type"'
    });
  }

  return next();
});

const requestThrottler = new RequestThrottler();

app.use((req: Request, res: Response, next: NextFunction) => requestThrottler.throttle(req, res, next));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// for test purpose
let server = new InversifyExpressServer(container, null, null, app);

server.setErrorConfig((app) => {
  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      error: 'Cannot ' + req.method + ' ' + req.url
    });
  });
});

export default server.build();
