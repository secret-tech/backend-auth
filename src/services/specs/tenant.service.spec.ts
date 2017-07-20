import { expect } from 'chai'
import tenantService from '../tenant.service'
import storageService from '../storage.service'
import JWTService from '../jwt.service'

describe('tenantService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#create', () => {
    it('should create new tenant', async () => {
      const tenant = { email: 'test@test.com', password: 'test', }
      const result = await tenantService.create(tenant)

      expect(result).to.be.a('object')
    })

    it('should require an email', async () => {
      const tenant = { email: '', password: 'test', }
      let error: Error

      try {
        await tenantService.create(tenant)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('Email and password are required parameters')
    })

    it('should require a password', async () => {
      const tenant = { email: 'test', password: '', }
      let error: Error

      try {
        await tenantService.create(tenant)
      } catch (e) {
        error = e
      }

      expect(error.message).to.equal('Email and password are required parameters')
    })

  })

  describe('#login', () => {
    it('should login tenant and return valid token', async () => {
      const tenant = { email: 'test@test.com', password: 'test', }
      const result = await tenantService.create(tenant)
      const token = await tenantService.login(tenant)

      const verified = await JWTService.verify(token)
      expect(verified).to.be.equal(true)
    })
  })
})

