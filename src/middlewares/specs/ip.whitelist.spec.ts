import * as express from 'express';
import { Response, Request, NextFunction, Application } from 'express';
import * as chai from 'chai';
import IpWhiteListFilter from '../ip.whitelist';

const { expect, request } = chai;

describe('IP whitelist filter', () => {
  describe('Test filter', () => {
    it ('should respond with 403 if IP is not in whitelist', (done) => {
      const app: Application = express();

      const filter = new IpWhiteListFilter([]);

      app.use((req: Request, res: Response, next: NextFunction) => filter.filter(req, res, next));

      const data = {};
      request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
        expect(res.status).to.equal(403);
        done();
      });
    });

    it ('should allow request if IP is in whitelist', (done) => {
      const app: Application = express();

      const filter = new IpWhiteListFilter([
        '127.0.0.1'
      ]);

      app.use((req: Request, res: Response, next: NextFunction) => filter.filter(req, res, next));

      const data = {};
      request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
        expect(res.status).to.equal(404); // 404 as test app doesn't have any routes
        done();
      });
    });
  });
});
