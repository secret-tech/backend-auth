import { Request, Response } from 'express'
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
  async create(req: Request, res: Response): Promise<void> {
    const { email, tenant, password, scope } = req.body

    if (!email || !password) {
      res.status(400).send({
        error: 'email and password are required parameters',
        status: 400
      })
      return
    }

    const result = await userService.create({ email, password, tenant, scope })

    res.json(result)
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async del(req: Request, res: Response): Promise<void> {
    const { login } = req.params

    if (!login) {
      res.status(400).send({
        error: 'login is a required parameter'
      })
      return
    }

    const result = await userService.del(login)

    result
        ? res.status(200).send({result: 1})
        : res.status(404).send({error: 'Specified login does not exist or was already deleted.'})
  }
}

export default UserController
