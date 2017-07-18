import storage, { StorageService } from './storage.service'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'


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
   * @param  login  user's login (company + email)
   * @return        promise
   */
  get(login: string): Promise<string> {
    return this.client.get(login)
  }


  /**
   * Save user's data
   *
   * @param userData user info
   * @return promise
   */
  create(userData: any): Promise<any> {
    const { email, tenant, password: passwordHash, scope, sub } = userData

    if (!email || !passwordHash || !tenant || !sub) {
      throw new Error('Email, password, tenant and sub are required parameters')
    }

    const password: string = bcrypt.hashSync(passwordHash)
    const login: string = `${tenant}:${email}`
    const data: any = {
      id: uuid.v4(),
      login,
      password,
      email,
      tenant,
      scope,
      sub,
    }
    this.client.set(login, JSON.stringify(data))
    return data
  }

  /**
   * Deletes user by login
   *
   * @param login
   * @return promise
   */
  del(login: string): Promise<any> {
    return this.client.del(login)
  }
}

export default new UserService(storage)
