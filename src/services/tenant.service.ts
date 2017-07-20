import { StorageService, StorageServiceType } from './storage.service'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'
import { KeyServiceInterface, KeyServiceType } from './key.service'
import { injectable, inject } from 'inversify'
import 'reflect-metadata'

export interface TenantServiceInterface {
  get: (key: string) => Promise<string>
  create: (userData: any) => Promise<any>
  login: (userData: any) => Promise<string>
}

/**
 * TenantService
 */
@injectable()
export class TenantService implements TenantServiceInterface {
  private client: StorageService
  private keyService: KeyServiceInterface
  /**
   * constructor
   *
   * @param  client  redis client
   * @param  keyService key service
   */
  constructor(
    @inject(StorageServiceType) client: StorageService,
    @inject(KeyServiceType) keyService: KeyServiceInterface
  ) {
    this.client = client
    this.keyService = keyService
  }


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

    return await this.keyService.setTenantToken(data)
  }

}

const TenantServiceType = Symbol('TenantService')
export { TenantServiceType }
