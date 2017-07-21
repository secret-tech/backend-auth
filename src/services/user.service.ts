import { StorageService, StorageServiceType } from './storage.service'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'
import { injectable, inject } from 'inversify'
import 'reflect-metadata'

export interface UserServiceInterface {
  get: (key: string) => Promise<string>
  create: (userData: any) => Promise<any>
  del: (key: string) => Promise<any>
  getKey: (tenant: string, login: string) => string
}
/**
 * UserService
 */
@injectable()
export class UserService implements UserServiceInterface {
  private storageService: StorageService
  /**
   * constructor
   *
   * @param  storageService  redis client
   */
  constructor(
    @inject(StorageServiceType) storageService: StorageService
  ) {
    this.storageService = storageService
  }


  /**
   * Return user's data
   *
   * @param  key  user's key (tenant + login)
   * @return        promise
   */
  get(key: string): Promise<string> {
    return this.storageService.get(key)
  }


  /**
   * Save user's data
   *
   * @param userData user info
   * @return promise
   */
  async create(userData: any): Promise<any> {
    const { email, tenant, login, password: passwordHash, scope, sub } = userData

    if (!email || !passwordHash || !tenant || !sub || !login) {
      throw new Error('Email, password, tenant, login and sub are required parameters')
    }

    const password: string = bcrypt.hashSync(passwordHash)
    const key: string = this.getKey(tenant, login)
    const data: any = {
      id: uuid.v4(),
      login,
      password,
      email,
      tenant,
      scope,
      sub,
    }
    await this.storageService.set(key, JSON.stringify(data))
    return data
  }

  /**
   * Deletes user by login
   *
   * @param key
   * @return promise
   */
  del(key: string): Promise<any> {
    return this.storageService.del(key)
  }

  getKey(tenant: string, login: string) {
    return `${tenant}:${login}`
  }
}

const UserServiceType = Symbol('UserServiceInterface')
export { UserServiceType }
