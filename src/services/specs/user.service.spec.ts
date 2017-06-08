import { expect } from 'chai'
import userService from '../user.service'
import storageService from '../storage.service'

describe('userService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#create', () => {
    it('should create new user', async () => {
      const user = { email: 'test', company: 'test', password: 'test' }
      const result = await userService.create(user)

      expect(result).to.equal('OK')
    })

    it('should require an email', async () => {
      const user = { email: '', company: 'test', password: 'test' }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })

    it('should require an password', async () => {
      const user = { email: 'test', company: 'test', password: '' }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })

    it('should require password and email', async () => {
      const user = { email: '', company: 'test', password: '' }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('email and password are required parameters')
    })
  })

  describe('#get', () => {
    before(async () => {
      const userData = { email: 'test', company: 'test', password: 'test' }
      await userService.create(userData)
    })

    it('should return user', async () => {
      const userStr = await userService.get('test:test')
      const user = JSON.parse(userStr)

      expect(user.login).to.equal('test:test')
    })
  })
})
