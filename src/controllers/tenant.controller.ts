import { Request, Response } from 'express'
import tenantService from '../services/tenant.service'

import jwtService from '../services/jwt.service'
import keyService from '../services/key.service'
import {JWTService} from '../services/jwt.service'

/**
 * TenantController
 */
class TenantController {

  /**
   * Create tenant
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async create(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).send({
        error: 'email and password are required parameters',
        status: 400
      })
      return
    }

    const result = await tenantService.create({ email, password })

    res.json(result)
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email , password } = req.body

    if (!email || !password) {
      res.status(400).send({
        error: 'Email and password are required parameters',
        status: 400
      })
      return
    }

    let token
    let error
    try {
      token = await tenantService.login({ email, password })
    } catch (e) {
      error = e.message
    }

    token
      ? res.status(200).send({ accessToken: token })
      : res.status(500).send({ error })
  }

  async logout(req: Request, res: Response): Promise<void> {
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

export default TenantController
