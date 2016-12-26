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
