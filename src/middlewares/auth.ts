import { Response, NextFunction } from 'express'
import { AuthorizedRequest } from '../requests/authorized.request'
import { JWTServiceType, JWTServiceInterface } from '../services/jwt.service'
import { container } from '../ioc.container'

export class Auth {
  jwtService

  /**
   * constructor
   */
  constructor() {
    this.jwtService = container.get<JWTServiceInterface>(JWTServiceType)
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

    req.tenant = this.jwtService.decode(token)
    return next()
  }
}
