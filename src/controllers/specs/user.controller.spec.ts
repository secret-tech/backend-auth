import * as chai from 'chai'

import app from '../../app'


const { expect, request } = chai

describe('Users', () => {
  describe('POST /user', () => {
    it('should create user', async () => {
      const params = { email: 'test', tenant: 'test', password: 'test' }
      const res = await request(app).post('/user').send(params)

      expect(res.status).to.equal(200)
    })

    it('should require email and password', async () => {
      let res: any
      try {
        res = await request(app).post('/user').send({})
      } catch (e) {
        res = e
      }
      expect(res.status).to.equal(400)
    })
  })

  describe('DELETE /user', () => {
    it('should delete user', async () => {
      const params = { email: 'test', tenant: 'test', password: 'test' }
      const create = await request(app).post('/user').send(params)

      const login = create.body.login
      const res = await request(app).del(`/user/${login}`)
      expect(res.status).to.equal(200)
      expect(res.body.result).to.equal(1)
    })

    it('should respond with 404 code if login is not found', async () => {
      let res: any
      try {
        res = await request(app).del('/user/123')
      } catch (e) {
        res = e
      }
      expect(res.status).to.equal(404)
    })
  })
})
