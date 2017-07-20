import storage, { StorageService } from './storage.service'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'
import KeyService from './key.service'
import * as jwt from 'jsonwebtoken'

/**
 * TenantService
 */
export class TenantService {

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
    const { email, password } = userData

    if (!email || !password) {
      throw new Error('Email and password are required parameters')
    }

    const passwordHash = bcrypt.hashSync(password)
    const login: string = `tenant:${email}`
    const data: any = {
      id: uuid.v4(),
      login,
      passwordHash,
      email,
    }

    this.client.set(login, JSON.stringify(data))

    delete data.passwordHash
    return data
  }

  async login(userData: any): Promise<string> {
    const { email, password } = userData

    if (!email || !password) {
      throw new Error('Email and password are required parameters')
    }

    const login: string = `tenant:${email}`
    const tenant = await this.get(login)

    if (!tenant) {
      throw new Error('Tenant is not found')
    }

    const data = JSON.parse(tenant)

    if (!bcrypt.compareSync(password, data.passwordHash)) {
      throw new Error('Password is incorrect')
    }

    return await KeyService.setTenantToken(data)
  }

}

export default new TenantService(storage)
