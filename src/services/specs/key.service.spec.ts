import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import { StorageServiceType, StorageService } from '../storage.service'
import { KeyServiceInterface, KeyServiceType } from '../key.service'
import { UserServiceType, UserServiceInterface } from '../user.service'
import { container } from '../../ioc.container'

const storageService = container.get<StorageService>(StorageServiceType)
const keyService = container.get<KeyServiceInterface>(KeyServiceType)
const userService = container.get<UserServiceInterface>(UserServiceType)

describe('keyService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#set', () => {
    before(async () => {
      const userData = { email: 'test', login: 'test', tenant: 'test', password: 'test', sub: '123', }
      await userService.create(userData)
    })

    it('should create session', async () => {
      const userStr = await userService.get('test:test')
      const user = JSON.parse(userStr)
      const token = await keyService.set(user, 'test')
      const data = jwt.decode(token)

      expect(data.login).to.equal('test')
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
        tenant: 'test',
        sub: '123',
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
        tenant: 'test',
        sub: '123',
      }
      const token = await keyService.set(user, 'test')
      sessionKey = jwt.decode(token).jti
    })

    it('should delete session', async () => {
      const result = await keyService.del(sessionKey)

      expect(result).to.equal(1)
    })
  })
})
