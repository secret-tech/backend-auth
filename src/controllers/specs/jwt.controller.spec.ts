import * as chai from 'chai'

import app from '../../app'
import { container } from '../../ioc.container'
import { UserServiceType, UserServiceInterface } from '../../services/user.service'
import { KeyServiceType, KeyServiceInterface } from '../../services/key.service'
import { StorageServiceType, StorageService } from '../../services/storage.service'
import { TenantServiceType, TenantServiceInterface } from '../../services/tenant.service'

chai.use(require('chai-http'))

const tenantService = container.get<TenantServiceInterface>(TenantServiceType)
const keyService = container.get<KeyServiceInterface>(KeyServiceType)
const storageService = container.get<StorageService>(StorageServiceType)
const userService = container.get<UserServiceInterface>(UserServiceType)

const { expect, request } = chai

let postRequest, token, tenant

describe('Authenticate', () => {
  beforeEach(async () => {
    const params = { email: 'test@test.com', password: 'test', }
    tenant = await tenantService.create(params)
    token = await tenantService.login(params)

    postRequest = (url: string) => {
      return request(app)
        .post(url)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
    }
  })

  describe('POST /auth', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should return 404', (done) => {
      const params = { login: 'test:test', password: 'test', deviceId: 'test' }

      postRequest('/auth').send(params).end((err, res) => {
        expect(res.status).to.equal(404)
        done()
      })
    })

    it('should require email and password', (done) => {
      postRequest('/auth').send({}).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })

    it('should authenticate user', (done) => {
      const user = { email: 'test', login: 'test', tenant: tenant.id, password: 'test',  sub: '123', }
      userService.create(user)
      const params = { login: 'test', password: 'test', deviceId: 'test' }
      postRequest('/auth').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
    })

    it('should respond with 403 error code when password is incorrect', (done) => {
      const user = { email: 'test', login: 'test', tenant: tenant.id, password: 'test',  sub: '123', }
      userService.create(user)
      const params = { login: 'test', password: 'test1', deviceId: 'test' }

      postRequest('/auth').send(params).end((err, res) => {
        expect(res.status).to.equal(403)
        done()
      })
    })
  })

  describe('POST /auth/logout', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should logout', (done) => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test',
        sub: '123',
      }

      keyService.set(user, 'test').then((token) => {
        postRequest('/auth/logout').send({ token }).end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body.result).to.equal(1)
          done()
        })
      })
    })

    it('should respond with 400 code when logout with incorrect token', (done) => {
      const token = '123'
      postRequest('/auth/logout').send({token}).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })
  })

  describe('POST /auth/verify', () => {
    after(async () => {
      await storageService.flushdb()
    })

    it('should be valid token', (done) => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        tenant: 'test',
        sub: '123',
      }

      keyService.set(user, 'test').then((token) => {
        postRequest('/auth/verify').send({ token }).end((err, res) => {
          expect(res.body).to.be.a('object')
          expect(res.body.decoded).to.be.a('object')
          done()
        })
      })
    })

    it('should be invalid token', (done) => {
      postRequest('/auth/verify').send({ token: 'test' }).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })
  })

})
