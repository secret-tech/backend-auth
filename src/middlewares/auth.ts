import { Response, NextFunction } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import jwtService, { JWTService } from '../services/jwt.service'

export class Auth {
  jwtService

  /**
   * constructor
   */
  constructor() {
    this.jwtService = jwtService
  }

  async authenticate(req: AuthorizedRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      return res.status(401).json({
        error: 'Not Authorized'
      })
    }

    const parts = req.headers.authorization.split(' ')

    if (parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Not Authorized'
      })
    }

    const token = parts[1]

    const verify = await this.jwtService.verify(token)

    if (!verify) {
      return res.status(401).json({
        error: 'Not Authorized'
      })
    }

    req.tenant = JWTService.decode(token)
    return next()
  }
}
