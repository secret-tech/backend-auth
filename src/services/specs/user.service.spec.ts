import { expect } from 'chai'
import userService from '../user.service'
import storageService from '../storage.service'

describe('userService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#create', () => {
    it('should create new user', async () => {
      const user = { email: 'test', tenant: 'test', password: 'test', sub: '123', }
      const result = await userService.create(user)

      expect(result).to.be.a('object')
    })

    it('should require an email', async () => {
      const user = { email: '', company: 'test', password: 'test',  sub: '123', }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('Email, password, tenant and sub are required parameters')
    })

    it('should require an password', async () => {
      const user = { email: 'test', company: 'test', password: '',  sub: '123', }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('Email, password, tenant and sub are required parameters')
    })

    it('should require password and email', async () => {
      const user = { email: '', company: 'test', password: '',  sub: '123', }
      let error: Error

      try {
        await userService.create(user)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('Email, password, tenant and sub are required parameters')
    })
  })

  describe('#get', () => {
    before(async () => {
      const userData = { email: 'test', tenant: 'test', password: 'test',  sub: '123', }
      await userService.create(userData)
    })

    it('should return user', async () => {
      const userStr = await userService.get('test:test')
      const user = JSON.parse(userStr)

      expect(user.login).to.equal('test:test')
    })
  })
})
