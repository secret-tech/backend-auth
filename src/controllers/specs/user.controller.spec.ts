import * as chai from 'chai'
import app from '../../app'
import tenantService from '../../services/tenant.service'
import userService from '../../services/user.service'

const { expect, request } = chai

let postRequest, delRequest, token, tenant

describe('Users', () => {
  before(async () => {
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
    let login

    before(async () => {
      delRequest = (url: string) => {
        return request(app)
          .del(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token)
      }

      const params = { email: 'test', login: 'test', tenant: tenant.id, password: 'test',  sub: '123', }
      const userData = await userService.create(params)
      login = userData.login
    })

    it('should delete user', (done) => {
      delRequest(`/user/${login}`).end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.equal(1)
        done()
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
