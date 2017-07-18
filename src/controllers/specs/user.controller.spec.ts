import * as chai from 'chai'
import app from '../../app'

const { expect, request } = chai

describe('Users', () => {
  describe('POST /user', () => {
    it('should create user', (done) => {
      const params = { email: 'test', tenant: 'test', password: 'test', sub: '123', }
      request(app).post('/user').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
    })

    it('should require email and password', async () => {
      request(app).post('/user').set('Accept', 'application/json').send({}).end((err, res) => {
        expect(res.status).to.equal(400)
      })
    })
  })

  describe('DELETE /user', () => {
    it('should delete user', (done) => {
      const params = { email: 'test', tenant: 'test', password: 'test',  sub: '123', }
      request(app).post('/user').set('Accept', 'application/json').send(params).end((err, created) => {
        const login = created.body.login
        request(app).del(`/user/${login}`).set('Accept', 'application/json').end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body.result).to.equal(1)
          done()
        })
      })
    })

    it('should respond with 404 code if login is not found', (done) => {
      request(app).del('/user/123').set('Accept', 'application/json').end((err, res) => {
        expect(res.status).to.equal(404)
        done()
      })
    })
  })
})
