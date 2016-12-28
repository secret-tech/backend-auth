import { expect } from 'chai'
import UserService from './UserService'

describe('UserService', () => {
  afterEach(async () => {
    await UserService.client.flushdb()
  })

  describe('#create', () => {
    it('should create new user', async () => {
      const user = { email: 'test', company: 'test', password: 'test' }
      const result = await UserService.create(user)

      expect(result).to.equal('OK')
    })

    it('should require an email', async () => {
      const user = { email: '', company: 'test', password: 'test' }
      let error = {}

      try {
        await UserService.create(user)
      } catch(e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })

    it('should require an password', async () => {
      const user = { email: 'test', company: 'test', password: '' }
      let error = {}

      try {
        await UserService.create(user)
      } catch(e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })

    it('should require password and email', async () => {
      const user = { email: '', company: 'test', password: '' }
      let error = {}

      try {
        await UserService.create(user)
      } catch(e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })
  })

  describe('#get', () => {
    before(async () => {
      const userData = { email: 'test', company: 'test', password: 'test' }
      await UserService.create(userData)
    })

    it('should return user', async () => {
      const userStr = await UserService.get('test:test')
      const user = JSON.parse(userStr)

      expect(user.login).to.equal('test:test')
    })
  })
})
