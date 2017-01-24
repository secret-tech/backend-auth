import { Request, Response } from 'express'
import UserService from '../services/UserService'

class UserController {
  async create(req: Request, res: Response): Promise<void> {
    const { email, company, password, scope } = req.body

  	if (!email || !password) {
  		res.status(400).send({
  			error: 'email and password are required parameters',
  			status: 400
  		})
      return
  	}

  	const result = await UserService.create({ email, password, company, scope })

  	res.json(result)
  }
}

export default UserController
