import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import KeyService from './KeyService'
import UserService from './UserService'

describe('KeyService', () => {
  afterEach(async () => {
    await UserService.client.flushdb()
  })

  describe('#set', () => {
    before(async () => {
      const userData = { email: 'test', company: 'test', password: 'test' }
      await UserService.create(userData)
    })

    it('should create session', async () => {
      const userStr = await UserService.get('test:test')
      const user = JSON.parse(userStr)
      const token = await KeyService.set(user, 'test')
      const data = jwt.decode(token)

      expect(data.login).to.equal('test:test')
    })
  })

  describe('#get', () => {
    let sessionKey = ''

    before(async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await KeyService.set(user, 'test')
      sessionKey = jwt.decode(token).jti
    })

    it('should return session', async () => {
      const userKey = await KeyService.get(sessionKey)

      expect(userKey).to.exists
    })
  })

  describe('#delete', () => {
    let sessionKey = ''

    before(async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await KeyService.set(user, 'test')
      sessionKey = jwt.decode(token).jti
    })

    it('should delete session', async () => {
      const userKey = await KeyService.delete(sessionKey)

      expect(userKey).to.equal(1)
    })
  })
})
