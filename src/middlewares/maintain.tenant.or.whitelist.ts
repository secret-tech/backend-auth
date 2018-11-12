import { Response, Request, NextFunction } from 'express';
import IpWhiteListFilter from './ip.whitelist';
import config from '../config';

export default class MaintainTenantFilter {
  constructor(private whiteListFilter: IpWhiteListFilter) {
  }

  filter(req, res: Response, next: NextFunction) {
    /* istanbul ignore next */
    if (config.tenant.maintainTlsCa && req.client.authorized && req.socket.getPeerCertificate()) {
      if (req.socket.getPeerCertificate().issuer.CN === config.tenant.maintainTlsCaCn) {
        return next();
      }
      return res.status(403).send({
        error: 'Forbidden'
      });
    }
    this.whiteListFilter.filter(req, res, next);
  }
}
