import * as express from 'express'
import { Response, Request, NextFunction, Application } from 'express'
import * as chai from 'chai'
import * as redis from 'redis'
import { RequestThrottler } from '../request.throttler'
import config from '../../config'

const { expect, request } = chai

describe('Request Throttler', () => {
  describe('Test throttler', () => {
    it ('should throttle', (done) => {
      const options = {
        namespace: '',
        interval: 1000,
        maxInInterval: 1,
        minDifference: 0,
        whiteList: []
      }

      const app: Application = express()

      const {redis: {port, host}} = config

      const redisClient = redis.createClient(port, host)

      const requestThrottler = new RequestThrottler(redisClient, options)

      app.use((req: Request, res: Response, next: NextFunction) => requestThrottler.throttle(req, res, next))

      const data = {}
      request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
        expect(res.status).to.equal(404) // 404 because throttle test app doesn't have any routes

        // send next request immediately and check it's getting throttled
        request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
          expect(res.status).to.equal(429)
          done()
        })
      })
    })

    it ('should throttle white list IP', (done) => {
      const options = {
        namespace: '',
        interval: 1000,
        maxInInterval: 1,
        minDifference: 0,
        whiteList: ['127.0.0.1']
      }

      const app: Application = express()

      const {redis: {port, host}} = config

      const redisClient = redis.createClient(port, host)

      const requestThrottler = new RequestThrottler(redisClient, options)

      app.use((req: Request, res: Response, next: NextFunction) => requestThrottler.throttle(req, res, next))

      const data = {}
      request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
        request(app).post('/user').set('Accept', 'application/json').send(data).end((err, res) => {
          expect(res.status).to.equal(404) // 404 because throttle test app doesn't have any routes
          done()
        })
      })
    })
  })
})
