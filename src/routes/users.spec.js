import chai from 'chai'
import chaiHTTP from 'chai-http'
import app from '../app'

chai.use(chaiHTTP)

const { expect, request } = chai

describe('Users', () => {
  describe('POST /user', () => {
    it('should create user', async () => {
      const params = { email: 'test', company: 'test', password: 'test' }
      const res = await request(app).post('/user').send(params)

      expect(res.status).to.equal(200)
    })

    it('should requare email and password', async () => {
      let res
      try {
        res = await request(app).post('/user').send({})
      } catch(e) {
        res = e
      }
      expect(res.status).to.equal(400)
    })
  })
})
