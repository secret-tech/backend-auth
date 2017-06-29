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

    it('should return 404', async () => {
      let res: any
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }

      try {
        res = await request(app).post('/auth').send(params)
      } catch (e) {
        res = e
      }
      expect(res.status).to.equal(404)
    })

    it('should require email and password', async () => {
      let res: any
      try {
        res = await request(app).post('/auth').send({})
      } catch (e) {
        res = e
      }
      expect(res.status).to.equal(400)
    })

    it('should authenticate user', async () => {
      const user = { email: 'test', tenant: 'test', password: 'test' }
      await userService.create(user)
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }
      const res = await request(app).post('/auth').send(params)

      expect(res.status).to.equal(200)
    })

    it('should respond with 403 error code when password is incorrect', async () => {
      const user = { email: 'test', tenant: 'test', password: 'test' }
      await userService.create(user)
      const params = { login: 'test:test', password: 'test1', deviceId: 'test' }

      let res: any

      try {
        res = await request(app).post('/auth').send(params)
      } catch (e) {
        res = e
      }

      expect(res.status).to.equal(403)
    })
  })

  describe('POST /auth/logout', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should logout', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test'
      }
      const token = await keyService.set(user, 'test')
      const res = await request(app).post('/auth/logout').send({ token })

      expect(res.status).to.equal(200)
      expect(res.body.result).to.equal(1)
    })

    it('should respond with 400 code when logout with incorrect token', async () => {
      const token = '123'
      let res: any

      try {
        res = await request(app).post('/auth/logout').send({token})
      } catch (e) {
        res = e
      }

      expect(res.status).to.equal(400)
    })
  })

  describe('POST /auth/verify', () => {
    after(async () => {
      await storageService.flushdb()
    })

    it('should be valid token', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test'
      }
      const token = await keyService.set(user, 'test')
      const res = await request(app).post('/auth/verify').send({ token })

      expect(res.body).to.be.a('object')
      expect(res.body.decoded).to.be.a('object')
    })

    it('should be invalid token', async () => {
      let res: any

      try {
        res = await request(app).post('/auth/verify').send({ token: 'test' })
      } catch (e) {
        res = e
      }

      expect(res.status).to.equal(400)
    })
  })

})
