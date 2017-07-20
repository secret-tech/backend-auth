import * as chai from 'chai'
import app from '../../app'
import storageService from '../../services/storage.service'
import tenantService from '../../services/tenant.service'

const { expect, request } = chai

describe('Tenants', () => {
  afterEach(async () => {
    await storageService.flushdb()
  })

  describe('POST /tenant', () => {
    it('should create tenant', (done) => {
      const params = { email: 'test@test.com', password: 'test' }
      request(app).post('/tenant').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.email).to.equal('test@test.com')
        expect(res.body.login).to.equal('tenant:test@test.com')
        expect(res.body).to.have.property('id')
        expect(res.body).to.not.have.property('passwordHash')
        done()
      })
    })

    it('should require email and password', (done) => {
      request(app).post('/tenant').set('Accept', 'application/json').send({}).end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
    })
  })

  describe('POST /tenant/login', () => {
    it('should authenticate tenant', (done) => {
      const tenant = {email: 'test@test.com', password: 'test', }
      tenantService.create(tenant)
      request(app).post('/tenant/login').set('Accept', 'application/json').send(tenant).end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('accessToken')
        done()
      })
    })

    it('should not authenticate tenant with incorrect password', (done) => {
      const tenant = {email: 'test@test.com', password: 'test', }
      tenantService.create(tenant)

      const params = {email: 'test@test.com', password: 'test1', }
      request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(500)
        expect(res.body.error).to.equal('Password is incorrect')
        done()
      })
    })

    it('should not authenticate tenant with incorrect email', (done) => {
      const tenant = { email: 'test@test.com', password: 'test', }
      tenantService.create(tenant)

      const params = { email: 'test1@test.com', password: 'test', }
      request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(500)
        expect(res.body.error).to.equal('Tenant is not found')
        done()
      })
    })

    it('should require email', (done) => {
      const params = { password: 'test' }
      request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(400)
        expect(res.body.error).to.equal('Email and password are required parameters')
        done()
      })
    })

    it('should require password', (done) => {
      const params = { email: 'test@test.com', }
      request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(400)
        expect(res.body.error).to.equal('Email and password are required parameters')
        done()
      })
    })
  })

  describe('POST /tenant/logout', () => {
    it('should logout', (done) => {
      const tenant = { email: 'test@test.com', password: 'test' }
      tenantService.create(tenant)
      tenantService.login(tenant).then((token) => {
        request(app).post('/tenant/logout').set('Accept', 'application/json').send({ token }).end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body.result).to.equal(1)
          done()
        })
      })
    })

    it('should respond with error for incorrect token', (done) => {
      const tenant = { email: 'test@test.com', password: 'test' }
      tenantService.create(tenant)
      tenantService.login(tenant).then((token) => {
        request(app).post('/tenant/logout').set('Accept', 'application/json').send({ token: token + '1' }).end((err, res) => {
          expect(res.status).to.equal(400)
          done()
        })
      })
    })
  })
})
