import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../requests/authorized.request';
import * as bcrypt from 'bcrypt-nodejs';

import { KeyServiceType, KeyServiceInterface } from '../services/key.service';
import { UserServiceType, UserServiceInterface } from '../services/user.service';
import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';
import * as request from 'web-request';
import config from '../config';

const { vk, fb } = config;

interface VkOAuthApiResponse {
  access_token: string;
  expires_in: number;
  user_id: number;
  email: string;
}

interface VkUserDataResponse {
  first_name: string;
  last_name: string;
  is_closed: boolean;
  can_access_closed: boolean;
}

interface FbOAuthApiResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

interface FbUserDataResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * JWTController
 */
@controller(
  '/auth',
  'AuthMiddleware'
)
export class JWTController {
  constructor(
    @inject(KeyServiceType) private keyService: KeyServiceInterface,
    @inject(UserServiceType) private userService: UserServiceInterface
  ) { }

  /**
   * OAuth FB
   *
   * @param  req  express req object.
   * Body should contain code: number and the same redirect_uri: string as in client request
   * @param  res  express res object
   * @param  next express next middleware function
   */
  @httpPost('/fb')
  async fbAuthorization(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, redirect_uri } = req.body;
      const { access_token } = await request.json<FbOAuthApiResponse>(`https://graph.facebook.com/v3.3/oauth/access_token?` +
        `client_id=${fb.id}` +
        `&redirect_uri=${redirect_uri}` +
        `&client_secret=${fb.secret}` +
        `&code=${code}`);

      const userData = await request.json<FbUserDataResponse>(`https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${access_token}`);

      const key = await this.userService.getKey(req.tenant.id, userData.email);
      let userStr = await this.userService.get(key);

      if (!userStr) {
        await this.userService.create({
          email: userData.email,
          password: '',
          login: userData.email,
          tenant: req.tenant.id,
          sub: 'register'
        });
        userStr = await this.userService.get(key);
      }

      const user = JSON.parse(userStr);
      const token = await this.keyService.set(user, 'default');
      await this.userService.updateLastActivity(req.tenant.id, userData.email);

      res.json({
        payload: {
          type: 'fb',
          fbId: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name
        },
        access_token: token
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * OAuth VK
   *
   * @param  req  express req object.
   * Body should contain code: number and the same redirect_uri: string as in client request
   * @param  res  express res object
   * @param  next express next middleware function
   */
  @httpPost('/vk')
  async vkAuthorization(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, redirect_uri } = req.body;
      const { email, user_id, access_token } = await request.json<VkOAuthApiResponse>(
        `https://oauth.vk.com/access_token?` +
        `client_id=${vk.id}` +
        `&client_secret=${vk.secret}` +
        `&redirect_uri=${redirect_uri}` +
        `&code=${code}`
      );

      const { response: [userData] } = await request.json<{response: VkUserDataResponse[]}>(`https://api.vk.com/method/users.get?&access_token=${access_token}&v=5.95`);
      const key = await this.userService.getKey(req.tenant.id, email);
      let userStr = await this.userService.get(key);

      if (!userStr) {
        await this.userService.create({
          email: email,
          password: '',
          login: email,
          tenant: req.tenant.id,
          sub: 'register'
        });
        userStr = await this.userService.get(key);
      }

      const user = JSON.parse(userStr);
      const token = await this.keyService.set(user, 'default');
      await this.userService.updateLastActivity(req.tenant.id, email);

      res.json({
        payload: {
          type: 'vk',
          vkId: user_id,
          email: email,
          firstName: userData.first_name,
          lastName: userData.last_name
        },
        access_token: token
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Generate and respond with token
   *
   * @param  req  express req object
   * @param  res  express res object
   * @param  next express next middleware function
   */
  @httpPost(
    '/',
    'CreateTokenValidation'
  )
  async create(req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { login, password, deviceId } = req.body;

      const key = this.userService.getKey(req.tenant.id, login);
      const userStr = await this.userService.get(key);

      if (!userStr) {
        res.status(404).send({
          error: 'User does not exist',
          status: 404
        });
        return;
      }

      const user = JSON.parse(userStr);
      const passwordMatch = bcrypt.compareSync(password, user.password);

      if (!passwordMatch) {
        res.status(403).send({
          error: 'Incorrect password',
          status: 403
        });
        return;
      }
      const token = await this.keyService.set(user, deviceId);
      this.userService.updateLastActivity(req.tenant.id, login);
      res.status(200).send({
        accessToken: token
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * Verify user's token
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost(
    '/verify',
    'TokenRequiredValidation'
  )
  async verify(req: AuthorizedRequest, res: Response): Promise<void> {
    const { token } = req.body;
    const { valid, decoded } = await this.keyService.verifyToken(token);

    if (!valid) {
      res.status(400).send({
        error: 'invalid token'
      });
      return;
    }
    this.userService.updateLastActivity(req.tenant.id, decoded.login);

    res.send({ decoded });
  }

  /**
   * Logout a user
   *
   * @param  req  express req object
   * @param  res  express res object
   */
  @httpPost(
    '/logout',
    'TokenRequiredValidation'
  )
  async logout(req: AuthorizedRequest, res: Response): Promise<void> {
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
}
