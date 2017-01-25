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
    const { email, company, password, scope } = req.body

    if (!email || !password) {
      res.status(400).send({
        error: 'email and password are required parameters',
        status: 400
      })
      return
    }

    const result = await userService.create({ email, password, company, scope })

    res.json(result)
  }
}

export default UserController
