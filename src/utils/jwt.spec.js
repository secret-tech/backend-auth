import { expect } from 'chai'
import KeyService from '../services/KeyService'
import JWT from './jwt'

describe('JWT', () => {
  describe('#generate', () => {
    it('should return token', () => {
      const user = {
        id: 'test',
        login: 'test:test'
      }
      const token = JWT.generate(user, 'device_id', 'key', 'user_key', Date.now(), 60)

      expect(token).to.exist
    })

    it('should require user.id and user.login', () => {
      const user = {
        id: '',
        login: ''
      }
      let error = {}

      try {
        JWT.generate(user, 'device_id', 'key', 'user_key', Date.now(), 60)
      } catch(e) {
        error = e
      }

      expect(error.message).to.equal('user.id and user.login are required parameters')
    })
  })

  describe('#secret', () => {
    it('should generate secret', () => {
      const secret = JWT.secret('user_key')

      expect(secret).to.equal('uZrJ!xe*xN?!;oU.u*;QOSM+|=4C?WH?6eWPcK/6AkIXIVGQguSA*r:user_key')
    })
  })

  describe("#verify", () => {
    it('should verify token', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await KeyService.set(user, 'test')
      const isValid = await JWT.verify(token)

      expect(isValid).to.be.true
    })

    it('should verify token', async () => {
      const isValid = await JWT.verify('invalid_token')

      expect(isValid).to.be.false
    })
  })
})
