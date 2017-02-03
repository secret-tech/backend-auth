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
   * @param  userData  user info
   * @return           promise   
   */
  create(userData: any): Promise<string> {
    const { email, company, password: passwordHash, scope } = userData

    if (!email || !passwordHash) {
      throw new Error('email and password are required parameters')
    }

    const password: string = bcrypt.hashSync(passwordHash)
    const login: string = `${company}:${email}`;
    const data: any = {
      id: uuid.v4(),
      login,
      password,
      email,
      company,
      scope
    };
    this.client.set(login, JSON.stringify(data));
    return data;
  }
}

export default new UserService(storage)
