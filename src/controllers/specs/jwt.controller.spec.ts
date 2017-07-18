import * as chai from 'chai'

import app from '../../app'
import userService from '../../services/user.service'
import keyService from '../../services/key.service'
import storageService from '../../services/storage.service'


chai.use(require('chai-http'))


const { expect, request } = chai

describe('Authenticate', () => {
  describe('POST /auth', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should return 404', (done) => {
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }

      request(app).post('/auth').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(404)
        done()
      })
    })

    it('should require email and password', (done) => {
      request(app).post('/auth').set('Accept', 'application/json').send({}).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })

    it('should authenticate user', (done) => {
      const user = { email: 'test', tenant: 'test', password: 'test',  sub: '123', }
      userService.create(user)
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }
      request(app).post('/auth').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
    })

    it('should respond with 403 error code when password is incorrect', (done) => {
      const user = { email: 'test', tenant: 'test', password: 'test',  sub: '123', }
      userService.create(user)
      const params = { login: 'test:test', password: 'test1', deviceId: 'test' }

      request(app).post('/auth').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(403)
        done()
      })
    })
  })

  describe('POST /auth/logout', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should logout', (done) => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test',
        sub: '123',
      }

      keyService.set(user, 'test').then((token) => {
        request(app).post('/auth/logout').set('Accept', 'application/json').send({ token }).end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body.result).to.equal(1)
          done()
        })
      })
    })

    it('should respond with 400 code when logout with incorrect token', (done) => {
      const token = '123'
      request(app).post('/auth/logout').set('Accept', 'application/json').send({token}).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })
  })

  describe('POST /auth/verify', () => {
    after(async () => {
      await storageService.flushdb()
    })

    it('should be valid token', (done) => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test',
        sub: '123',
      }

      keyService.set(user, 'test').then((token) => {
        request(app).post('/auth/verify').set('Accept', 'application/json').send({ token }).end((err, res) => {
          expect(res.body).to.be.a('object')
          expect(res.body.decoded).to.be.a('object')
          done()
        })
      })
    })

    it('should be invalid token', (done) => {
      request(app).post('/auth/verify').set('Accept', 'application/json').send({ token: 'test' }).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })
  })

})
