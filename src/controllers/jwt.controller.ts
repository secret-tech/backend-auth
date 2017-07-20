import { Response, NextFunction } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import * as bcrypt from 'bcrypt-nodejs'

import jwtService from '../services/jwt.service'
import keyService from '../services/key.service'
import userService, {UserService} from '../services/user.service'
import { JWTService } from '../services/jwt.service'
import {log} from "util";


/**
 * JWTController
 */
class JWTController {

  /**
   * Generate and respond with token
   *
   * @param  req  express req object
   * @param  res  express res object
   * @param  next express next middleware function
   */
  async create(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { login, password, deviceId } = req.body

      if (!login || !password || !deviceId) {
        res.status(400).send({
          error: 'login, password and deviceId are required parameters',
          status: 400
        })
        return
      }

      const key = userService.getKey(req.tenant.id, login)
      const userStr = await userService.get(key)

      if (!userStr) {
        res.status(404).send({
          error: 'User does not exist',
          status: 404
        })
        return
      }

      const user = JSON.parse(userStr)
      const passwordMatch = bcrypt.compareSync(password, user.password)

      if (!passwordMatch) {
        res.status(403).send({
          error: 'Incorrect password',
          status: 403
        })
        return
      }

      const token = await keyService.set(user, deviceId)

      res.status(200).send({
        accessToken: token
      })
    } catch (e) {
      next(e)
    }
  }

  /**
   * Verify user's token
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async verify(req: AuthorizedRequest, res: Response): Promise<void> {
    const { token } = req.body
    const isValid = await jwtService.verify(token)

    if (!isValid) {
      res.status(400).send({
        error: 'invalid token'
      })
      return
    }

    res.send({decoded: JWTService.decode(token)})
  }

  /**
   * Logout a user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async logout(req: AuthorizedRequest, res: Response): Promise<void> {
    const { token } = req.body
    const isValid = await jwtService.verify(token)

    if (!isValid) {
      res.status(400).send({
        error: 'invalid token'
      })
      return
    }

    const decoded = JWTService.decode(token)
    const result = await keyService.delete(decoded.jti)

    result
        ? res.status(200).send({ result: result })
        : res.status(404).send({ error: 'Session does not exist or has expired. Please sign in to continue.' })
  }
}

export default JWTController
