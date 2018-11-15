import { Response } from 'express';
import { AuthorizedRequest } from '../requests/authorized.request';
import { UserServiceType, UserServiceInterface } from '../services/user.service';
import { inject } from 'inversify';
import { controller, httpDelete, httpPost, httpGet } from 'inversify-express-utils';

/**
 * UserController
 */
@controller(
  '/user',
  'AuthMiddleware'
)
export class UserController {
  constructor(
    @inject(UserServiceType) private userService: UserServiceInterface
  ) { }

  /**
   * Create user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost(
    '/',
    'CreateUserValidation'
  )
  async create(req: AuthorizedRequest, res: Response): Promise<void> {
    const { email, login, password, scope, sub } = req.body;

    const result = await this.userService.create({ email, login, password, tenant: req.tenant.id, scope, sub });

    res.json(result);
  }

  // @TODO: add request validation for security reason
  @httpGet(
    '/',
    'ListUsersValidation'
  )
  async listUsers(req: AuthorizedRequest, res: Response): Promise<void> {
    if (req.query.q) {
      const query = req.tenant.id + ':' + req.query.q;
      const result = await this.userService.get(query);
      if (result === null) res.status(200).send({ users: [] });
      else res.status(200).send({ users: result });
    } else {
      const cursor: string = req.query.cursor ? req.query.cursor : '0';
      const result = await this.userService.listForTenant(req.tenant.id, cursor);
      res.status(200).send(result);
    }
  }

  /**
   * Delete user
   * This method does not have any validator attached.
   * If DELETE /user/ is called no route will be found and route will throw 404 before this method is reached.
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpDelete(
    '/:login'
  )
  async del(req: AuthorizedRequest, res: Response): Promise<void> {
    const { login } = req.params;

    const key = this.userService.getKey(req.tenant.id, login);
    const result = await this.userService.del(key);

    result
        ? res.status(200).send({result: 1})
        : res.status(404).send({error: 'Specified login does not exist or was already deleted.'});
  }
}
