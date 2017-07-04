import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import storageService from '../storage.service'
import keyService from '../key.service'
import userService from '../user.service'

describe('keyService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#set', () => {
    before(async () => {
      const userData = { email: 'test', tenant: 'test', password: 'test' }
      await userService.create(userData)
    })

    it('should create session', async () => {
      const userStr = await userService.get('test:test')
      const user = JSON.parse(userStr)
      const token = await keyService.set(user, 'test')
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
        tenant: 'test'
      }
      const token = await keyService.set(user, 'test')
      sessionKey = jwt.decode(token).jti
    })

    it('should return session', async () => {
      const userKey = await keyService.get(sessionKey)

      expect(userKey).to.exist
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
      const token = await keyService.set(user, 'test')
      sessionKey = jwt.decode(token).jti
    })

    it('should delete session', async () => {
      const userKey = await keyService.delete(sessionKey)

      expect(userKey).to.equal(1)
    })
  })
})
