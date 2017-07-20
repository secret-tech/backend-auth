import { Response } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import userService from '../services/user.service'

/**
 * UserController
 */
class UserController {

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async create(req: AuthorizedRequest, res: Response): Promise<void> {
    const { email, login, password, scope, sub } = req.body

    if (!email || !password || !sub || !login) {
      res.status(400).send({
        error: 'email, password, tenant and sub are required parameters',
        status: 400
      })
      return
    }

    const result = await userService.create({ email, login, password, tenant: req.tenant.id, scope, sub })

    res.json(result)
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async del(req: AuthorizedRequest, res: Response): Promise<void> {
    const { login } = req.params

    if (!login) {
      res.status(400).send({
        error: 'login is a required parameter'
      })
      return
    }

    const key = userService.getKey(req.tenant.id, login)
    const result = await userService.del(key)

    result
        ? res.status(200).send({result: 1})
        : res.status(404).send({error: 'Specified login does not exist or was already deleted.'})
  }
}

export default UserController
