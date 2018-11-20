import { StorageService, StorageServiceType } from './storage.service';
import * as uuid from 'node-uuid';
import * as bcrypt from 'bcrypt-nodejs';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

type UserData = {
  email: string,
  tenant: string,
  login: string,
  password: string,
  sub: string
  scope?: any
};

export interface UserServiceInterface {
  get: (key: string) => Promise<string>;
  listForTenant: (tenantId: string, cursor: string) => Promise<any>;
  create: (userData: UserData) => Promise<any>;
  del: (key: string) => Promise<any>;
  getKey: (tenant: string, login: string) => string;
  updateLastActivity: (tenant: string, login: string) => Promise<boolean>;
}

/**
 * UserService
 */
@injectable()
export class UserService implements UserServiceInterface {
  /**
   * constructor
   *
   * @param  storageService  redis client
   */
  constructor(
    @inject(StorageServiceType) private storageService: StorageService
  ) { }

  /**
   * Return user's data
   *
   * @param  key  user's key (tenant + login)
   * @return        promise
   */
  get(key: string): Promise<string> {
    return this.storageService.get(key);
  }

  /**
   * Save user's data
   *
   * @param userData user info
   * @return promise
   */
  async create(userData: UserData): Promise<any> {
    const { email, tenant, login, password: passwordHash, scope, sub } = userData;
    const password: string = passwordHash.length === 60 ? passwordHash : bcrypt.hashSync(passwordHash);
    const key: string = this.getKey(tenant, login);
    const registrationDate = Date.now();
    const data: any = {
      id: uuid.v4(),
      login,
      password,
      email,
      tenant,
      registrationDate,
      lastActivity: registrationDate,
      scope,
      sub
    };
    await this.storageService.set(key, JSON.stringify(data));
    delete data.password;
    return data;
  }

  async updateLastActivity(tenant: string, login: string): Promise<boolean> {
    const key: string = this.getKey(tenant, login);
    let user = JSON.parse(await this.storageService.get(key));
    if (!user) {
      return false;
    }
    user.lastActivity = Date.now();
    await this.storageService.set(key, JSON.stringify(user));
    return true;
  }

  /**
   * List users for specified tenant
   * @TODO: add test
   * @param tenantId string with id of tenant to list users for
   * @return Promise
   */
  async listForTenant(tenantId: string, cursor: string): Promise<any> {
    const keys: Array<any> = await this.storageService.scan(cursor, '*' + tenantId + ':*');
    if (keys.length <= 1) {
      return { users: [], nextCursor: '0' };
    }
    const nextCursor = keys.splice(0, 1)[0];
    if (!keys[0] || keys[0].length === 0) {
      return { users: [], nextCursor };
    }
    const rawUsers = await this.storageService.mget(keys[0]);
    if (rawUsers[0] == null) return { users: [], nextCursor };
    const parsedUsers = rawUsers.map((user) => {
      const modifiedUser: UserData = JSON.parse(user);
      delete modifiedUser.password;
      delete modifiedUser.tenant;
      return modifiedUser;
    });
    return { users: parsedUsers, nextCursor };
  }

  /**
   * Deletes user by login
   *
   * @param key
   * @return promise
   */
  del(key: string): Promise<any> {
    return this.storageService.del(key);
  }

  getKey(tenant: string, login: string) {
    return `${tenant}:${login}`;
  }
}

const UserServiceType = Symbol('UserServiceInterface');
export { UserServiceType };
