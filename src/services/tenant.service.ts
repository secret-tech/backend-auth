import { StorageService, StorageServiceType } from './storage.service';
import * as uuid from 'node-uuid';
import * as bcrypt from 'bcrypt-nodejs';
import { KeyServiceInterface, KeyServiceType } from './key.service';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';

type TenantData = {
  email: string,
  password: string
};

export interface TenantServiceInterface {
  get: (key: string) => Promise<string>;
  create: (userData: TenantData) => Promise<any>;
  login: (userData: TenantData) => Promise<string>;
}

/**
 * TenantService
 */
@injectable()
export class TenantService implements TenantServiceInterface {
  /**
   * constructor
   *
   * @param  client  redis client
   * @param  keyService key service
   */
  constructor(
    @inject(StorageServiceType) private client: StorageService,
    @inject(KeyServiceType) private keyService: KeyServiceInterface
  ) { }

  /**
   * Return user's data
   *
   * @param  login  user's login (company + email)
   * @return        promise
   */
  get(login: string): Promise<string> {
    return this.client.get(login);
  }

  /**
   * Save user's data
   *
   * @param userData user info
   * @return promise
   */
  async create(userData: TenantData): Promise<any> {
    const { email, password } = userData;

    const passwordHash = bcrypt.hashSync(password);
    const login: string = `tenant:${email}`;

    const exists = await this.get(login);
    if (exists) {
      throw new Error('This tenant\'s email already exists');
    }

    const data: any = {
      id: uuid.v4(),
      login,
      passwordHash,
      email
    };

    this.client.set(login, JSON.stringify(data));

    delete data.passwordHash;
    return data;
  }

  async login(userData: TenantData): Promise<string> {
    const { email, password } = userData;

    const login: string = `tenant:${email}`;
    const tenant = await this.get(login);

    if (!tenant) {
      throw new Error('Tenant is not found');
    }

    const data = JSON.parse(tenant);

    if (!bcrypt.compareSync(password, data.passwordHash)) {
      throw new Error('Password is incorrect');
    }

    return await this.keyService.setTenantToken(data);
  }

}

const TenantServiceType = Symbol('TenantService');
export { TenantServiceType };
