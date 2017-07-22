import { container } from '../../ioc.container'
import { expect } from 'chai'
import { KeyServiceType, KeyServiceInterface } from '../key.service'
import { StorageServiceType, StorageService } from '../storage.service'
import { TenantServiceType, TenantServiceInterface } from '../tenant.service'


const keyService = container.get<KeyServiceInterface>(KeyServiceType)
const tenantService = container.get<TenantServiceInterface>(TenantServiceType)
const storageService = container.get<StorageService>(StorageServiceType)

describe('tenantService', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('#create', () => {
    it('should create new tenant', async () => {
      const tenant = { email: 'test@test.com', password: 'test' }
      const result = await tenantService.create(tenant)

      expect(result).to.be.a('object')
    })

    it('should require an email', async () => {
      const tenant = { email: '', password: 'test' }
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
      const tenant = { email: 'test@test.com', password: 'test' }
      const result = await tenantService.create(tenant)
      const token = await tenantService.login(tenant)

      const { valid } = await keyService.verifyToken(token)
      expect(valid).to.be.equal(true)
    })
  })
})
