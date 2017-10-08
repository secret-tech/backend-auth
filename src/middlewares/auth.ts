import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../requests/authorized.request';
import { KeyServiceInterface } from '../services/key.service';

export class Auth {
  /**
   * constructor
   */
  constructor(private keyService: KeyServiceInterface) {
    this.keyService = keyService;
  }

  async authenticate(req: AuthorizedRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      return res.status(401).json({
        error: 'Not Authorized'
      });
    }

    const parts = req.headers.authorization.split(' ');

    if (parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Not Authorized'
      });
    }

    const token = parts[1];

    const { valid, decoded } = await this.keyService.verifyToken(token);

    if (!valid || !decoded.isTenant) {
      return res.status(401).json({
        error: 'Not Authorized'
      });
    }

    req.tenant = decoded;
    return next();
  }
}
