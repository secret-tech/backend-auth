import * as chai from 'chai'
import app from '../../app'
import { container } from '../../ioc.container'
import { UserServiceType, UserServiceInterface } from '../../services/user.service'
import { TenantServiceType, TenantServiceInterface } from '../../services/tenant.service'
import { StorageServiceType, StorageService } from '../../services/storage.service'

const { expect, request } = chai

const tenantService = container.get<TenantServiceInterface>(TenantServiceType)
const userService = container.get<UserServiceInterface>(UserServiceType)
const storageService = container.get<StorageService>(StorageServiceType)

let postRequest, delRequest, token, tenant

describe('Users', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  beforeEach(async () => {
    const params = { email: 'test@test.com', password: 'test', }
    tenant = await tenantService.create(params)
    token = await tenantService.login(params)
  })

  describe('POST /user', () => {
    before(async () => {
      postRequest = (url: string) => {
        return request(app)
          .post(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token)
      }
    })

    it('should create user', (done) => {
      const params = { email: 'test', login: 'test', tenant: tenant.id, password: 'test', sub: '123', }
      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
    })

    it('should require email and password', async () => {
      postRequest('/user').send({}).end((err, res) => {
        expect(res.status).to.equal(400)
      })
    })
  })

  describe('DELETE /user', () => {
    before(async () => {
      delRequest = (url: string) => {
        return request(app)
          .del(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token)
      }
    })

    it('should delete user', (done) => {
      const params = { email: 'test', login: 'test', tenant: tenant.id, password: 'test',  sub: '123', }
      const userData = userService.create(params).then((userData) => {
        delRequest(`/user/${userData.login}`).end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body.result).to.equal(1)
          done()
        })
      })
    })

    it('should respond with 404 code if login is not found', (done) => {
      delRequest('/user/123').end((err, res) => {
        expect(res.status).to.equal(404)
        done()
      })
    })
  })
})
