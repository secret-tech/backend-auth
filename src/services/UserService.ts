import storage, { StorageService } from './StorageService'
import * as Promise from 'bluebird'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'


export class UserService {
  client: StorageService

  constructor(client: StorageService) {
    this.client = client
  }

  get(login: string): Promise<string> {
    return this.client.get(login)
  }

  create(userData: any): Promise<string> {
    const { email, company, password: passwordHash, scope } = userData

    if (!email || !passwordHash) {
      throw new Error('email and password are required parameters')
    }

    const password: string = bcrypt.hashSync(passwordHash)
    const login: string = `${company}:${email}`

    return this.client.set(login, JSON.stringify({
      id: uuid.v4(),
      login,
      password,
      email,
      company,
      scope
    }))
  }
}

export default new UserService(storage)
