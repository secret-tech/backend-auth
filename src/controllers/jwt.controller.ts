import { Response, NextFunction } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import * as bcrypt from 'bcrypt-nodejs'

import { KeyServiceType, KeyServiceInterface } from '../services/key.service'
import { UserServiceType, UserServiceInterface } from '../services/user.service'
import { inject, injectable } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'

/**
 * JWTController
 */
@injectable()
@controller(
  '/auth',
  'AuthMiddleware'
)
export class JWTController {
  constructor(
    @inject(KeyServiceType) private keyService: KeyServiceInterface,
    @inject(UserServiceType) private userService: UserServiceInterface,
  ) { }

  /**
   * Generate and respond with token
   *
   * @param  req  express req object
   * @param  res  express res object
   * @param  next express next middleware function
   */
  @httpPost('/')
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

      const key = this.userService.getKey(req.tenant.id, login)
      const userStr = await this.userService.get(key)

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

      const token = await this.keyService.set(user, deviceId)

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
  @httpPost('/verify')
  async verify(req: AuthorizedRequest, res: Response): Promise<void> {
    const { token } = req.body
    const { valid, decoded } = await this.keyService.verifyToken(token)

    if (!valid) {
      res.status(400).send({
        error: 'invalid token'
      })
      return
    }

    res.send({ decoded })
  }

  /**
   * Logout a user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost('/logout')
  async logout(req: AuthorizedRequest, res: Response): Promise<void> {
    const { token } = req.body
    const { valid, decoded } = await this.keyService.verifyToken(token)

    if (!valid) {
      res.status(400).send({
        error: 'invalid token'
      })
      return
    }

    const result = await this.keyService.del(decoded.jti)

    result
        ? res.status(200).send({ result: result })
        : res.status(404).send({ error: 'Session does not exist or has expired. Please sign in to continue.' })
  }
}
