import storage, { StorageService } from './storage.service'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'
import {log} from "util";


/**
 * UserService
 */
export class UserService {

  /**
   * constructor
   *
   * @param  client  redis client
   */
  constructor(private client: StorageService) {}


  /**
   * Return user's data
   *
   * @param  key  user's key (tenant + login)
   * @return        promise
   */
  get(key: string): Promise<string> {
    return this.client.get(key)
  }


  /**
   * Save user's data
   *
   * @param userData user info
   * @return promise
   */
  create(userData: any): Promise<any> {
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
    this.client.set(key, JSON.stringify(data))
    return data
  }

  /**
   * Deletes user by login
   *
   * @param key
   * @return promise
   */
  del(key: string): Promise<any> {
    return this.client.del(key)
  }

  getKey(tenant: string, login: string) {
    return `${tenant}:${login}`
  }
}

export default new UserService(storage)
