import { Request, Response, NextFunction } from 'express'
import * as bcrypt from 'bcrypt-nodejs'

import JWT from '../utils/jwt'
import KeyService from '../services/KeyService'
import UserService from '../services/UserService'

class JWTController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { login, password, deviceId } = req.body

      if (!login || !password || !deviceId) {
        res.status(400).send({
          error: 'login, password and deviceId are required parameters',
          status: 400
        })
        return
      }

      const userStr = await UserService.get(login)

      if (!userStr) {
        res.status(404).send({
          error: 'User does not exist',
          status: 404
        })
        return
      }

      const user = JSON.parse(userStr)
      const passwordMatch = bcrypt.compareSync(password, user.password)

      if(!passwordMatch) {
        res.status(403).send({
          error: 'Incorrect password',
          status: 403
        })
        return
      }

      const token = await KeyService.set(user, deviceId)

      res.status(200).send({
        accessToken: token
      })
    } catch(e) {
      next(e)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionKey }  = req.params

      if (!sessionKey) {
        res.status(400).send({
          error: 'sessionKey is a required parameter'
        })
        return
      }

      const result = await KeyService.delete(sessionKey)

      result
        ? res.status(204).send()
        : res.status(404).send()
    } catch(e) {
      next(e)
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    const { token } = req.body
    const isValid = await JWT.verify(token)

    if(!isValid) {
      res.status(400).send({
        error: 'invalid token'
      })
      return
    }

  	res.send(isValid)
  }
}

export default JWTController
