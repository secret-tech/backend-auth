import * as express from 'express'
import { Response, Request, NextFunction, Application } from 'express'
import chai = require('chai')
import chaiHttp = require('chai-http')
import { Auth } from '../auth'

chai.use(chaiHttp)
const expect = chai.expect
const request = chai.request

const app: Application = express()
const auth: Auth = new Auth()

app.use((req: Request, res: Response, next: NextFunction) => auth.authenticate(req, res, next))

describe('Auth Middleware', () => {
  describe('Test Auth', () => {
    it ('should require Authorization header', (done) => {
      request(app).get('/smth').end((err, res) => {
        expect(res.status).to.equal(401)
        done()
      })
    })

    it ('should require Bearer', (done) => {
      request(app).get('/smth').set('Authorization', 'Something').end((err, res) => {
        expect(res.status).to.equal(401)
        done()
      })
    })

    it ('should not auth incorrect token', (done) => {
      request(app).get('/smth').set('Authorization', 'Bearer token').end((err, res) => {
        expect(res.status).to.equal(401)
        done()
      })
    })
  })
})
