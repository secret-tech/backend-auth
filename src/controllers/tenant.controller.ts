import { Request, Response } from 'express';
import { TenantServiceType, TenantServiceInterface } from '../services/tenant.service';
import { KeyServiceInterface, KeyServiceType } from '../services/key.service';
import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';

/**
 * TenantController
 */
@controller('/tenant')
export class TenantController {
  constructor(
    @inject(TenantServiceType) private tenantService: TenantServiceInterface,
    @inject(KeyServiceType) private keyService: KeyServiceInterface
  ) { }

  /**
   * Create tenant
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost(
    '/',
    'CreateTenantValidation',
    'MaintainTenantFilter'
  )
  async create(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      let result = await this.tenantService.create({ email, password });
      result.token = await this.tenantService.login({ email, password });
      res.json(result);
    } catch (e) {
      res.status(400).json({
        error: e.message
      });
    }
  }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost(
    '/login',
    'LoginTenantValidation'
  )
  async login(req: Request, res: Response): Promise<void> {
    const { email , password } = req.body;

    let token;
    let error;
    try {
      token = await this.tenantService.login({ email, password });
    } catch (e) {
      error = e.message;
    }

    token
      ? res.status(200).send({ token })
      : res.status(500).send({ error });
  }

  @httpPost(
    '/logout',
    'TokenRequiredValidation'
  )
  async logout(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    const { valid, decoded } = await this.keyService.verifyToken(token);

    if (!valid) {
      res.status(400).send({
        error: 'invalid token'
      });
      return;
    }

    const result = await this.keyService.del(decoded.jti);

    result
      ? res.status(200).send({ result: result })
      : res.status(404).send({ error: 'Session does not exist or has expired. Please sign in to continue.' });
  }

  @httpPost(
    '/verify',
    'TokenRequiredValidation'
  )
  async verify(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    const { valid, decoded } = await this.keyService.verifyToken(token);

    if (!valid) {
      res.status(400).send({
        error: 'invalid token'
      });
      return;
    }

    res.status(200).send({ decoded: decoded });
  }
}
