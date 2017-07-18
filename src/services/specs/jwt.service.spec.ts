import { expect } from 'chai'
import keyService from '../key.service'
import jwtService from '../jwt.service'

describe('jwtService', () => {
  describe('#generate', () => {
    it('should return token', () => {
      const user = {
        id: 'test',
        login: 'test:test',
        sub: '123',
      }
      const token = jwtService.generate(user, 'device_id', 'key', 'user_key', Date.now(), 60)

      expect(token).to.exist
    })

    it('should require user.id and user.login', () => {
      const user = {
        id: '',
        login: '',
        sub: '123',
      }
      let error: Error

      try {
        jwtService.generate(user, 'device_id', 'key', 'user_key', Date.now(), 60)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('user.id and user.login are required parameters')
    })
  })

  describe('#verify', () => {
    it('should verify token', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test',
        sub: '123',
      }
      const token = await keyService.set(user, 'test')
      const isValid = await jwtService.verify(token)

      expect(isValid).to.be.true
    })

    it('should verify token', async () => {
      const isValid = await jwtService.verify('invalid_token')

      expect(isValid).to.be.false
    })
  })
})
