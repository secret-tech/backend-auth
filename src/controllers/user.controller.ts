import { Response } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import { UserServiceType, UserServiceInterface } from '../services/user.service'
import { inject, injectable } from 'inversify'
import {controller, httpDelete, httpPost} from 'inversify-express-utils'
import 'reflect-metadata'

/**
 * UserController
 */
@injectable()
@controller(
  '/user',
  'AuthMiddleware'
)
export class UserController {
  private userService: UserServiceInterface

  constructor(@inject(UserServiceType) userService: UserServiceInterface) {
    this.userService = userService
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost('/')
  async create(req: AuthorizedRequest, res: Response): Promise<void> {
    const { email, login, password, scope, sub } = req.body

    if (!email || !password || !sub || !login) {
      res.status(400).send({
        error: 'email, password, tenant and sub are required parameters',
        status: 400
      })
      return
    }

    const result = await this.userService.create({ email, login, password, tenant: req.tenant.id, scope, sub })

    res.json(result)
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpDelete('/:login')
  async del(req: AuthorizedRequest, res: Response): Promise<void> {
    const { login } = req.params

    if (!login) {
      res.status(400).send({
        error: 'login is a required parameter'
      })
      return
    }

    const key = this.userService.getKey(req.tenant.id, login)
    const result = await this.userService.del(key)

    result
        ? res.status(200).send({result: 1})
        : res.status(404).send({error: 'Specified login does not exist or was already deleted.'})
  }
}
