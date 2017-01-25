import { Response } from 'express'
import * as chai from 'chai'
import * as jwt from 'jsonwebtoken'

import app from '../../app'
import keyService from '../../services/key.service'
import storageService from '../../services/storage.service'


const { expect, request } = chai

describe('Session', () => {
  describe('GET /session/:sessionKey', () => {
    afterEach(async () => {
      await storageService.flushdb()
    })

    it('should return session', async () => {
      const user = {
        id: 'a50e5d6b-1037-4e99-9fa3-f555f1df0bd6',
        login: 'test:test',
        password: '$2a$10$V5o4Ezdqcbip1uzFRlxgFu77dwJGYhwlGwM2W66JqSN3AUFwPpKRO',
        email: 'test',
        company: 'test'
      }
      const token = await keyService.set(user, 'test')
      const sessionKey = jwt.decode(token).jti
      const res = await request(app).get(`/session/${sessionKey}`)

      expect(res.body.userKey).to.exist
    })

    it('should return 404', async () => {
      let res: any

      try {
        res = await request(app).get('/session/test')
      } catch (e) {
        res = e
      }

      expect(res.status).to.equal(404)
    })
  })
})
