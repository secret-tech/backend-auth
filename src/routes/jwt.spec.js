import chai from 'chai'
import chaiHTTP from 'chai-http'
import app from '../app'
import jwt from 'jsonwebtoken'
import UserService from '../services/UserService'
import KeyService from '../services/KeyService'

chai.use(chaiHTTP)

const { expect, request } = chai

describe('Authenticate', () => {
  describe('POST /auth', () => {
    afterEach(async () => {
      await UserService.client.flushdb()
    })

    it('should return 404', async () => {
      let res
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }

      try {
        res = await request(app).post('/auth').send(params)
      } catch(e) {
        res = e
      }
      expect(res.status).to.equal(404)
    })

    it('should requare email and password', async () => {
      let res
      try {
        res = await request(app).post('/auth').send({})
      } catch (e) {
        res = e
      }
      expect(res.status).to.equal(400)
    })

    it('should authenticate user', async () => {
      const user = { email: 'test', company: 'test', password: 'test' }
      await UserService.create(user)
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }
      const res = await request(app).post('/auth').send(params)

      expect(res.status).to.equal(200)
    })
  })

  describe('POST /auth/verify', () => {
    after(async () => {
      await KeyService.client.flushdb()
    })

    it('should be valid token', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await KeyService.set(user, 'test')
      const res = await request(app).post('/auth/verify').send({ token })

      expect(res.body).to.equal(true)
    })

    it('should be invalid token', async () => {
      let res

      try {
        res = await request(app).post('/auth/verify').send({ token: 'test' })
      } catch(e) {
        res = e
      }

      expect(res.status).to.equal(400)
    })
  })

  describe('DELETE /auth/:sessionKey', () => {
    after(async () => {
      await KeyService.client.flushdb()
    })

    it('should delete session', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await KeyService.set(user, 'test')
      const sessionKey = jwt.decode(token).jti
      const res = await request(app).delete(`/auth/${sessionKey}`)

      expect(res.status).to.equal(204)
    })

    it('should return 404', async () => {
      let res

      try {
        res = await request(app).delete('/auth/test')
      } catch(e) {
        res = e
      }

      expect(res.status).to.equal(404)
    })
  })
})
