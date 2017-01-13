import * as redis from 'redis'
import * as bluebird from 'bluebird'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt-nodejs'

import config from '../config'

const { redis: { port, host } } = config
const client: any = bluebird.promisifyAll(redis.createClient(port, host))

const UserService = {
  // Redis client
  client,

  // Retrieve a user by it's login
  get(login) {
    return client.getAsync(login)
  },

  // Create new user
  create(userData) {
    const { email, company, password, scope } = userData

    if (!email || !password) {
      throw new Error('email and password are required parameters')
    }

    const pwd = bcrypt.hashSync(password)
    const login = `${company}:${email}`

    return client.setAsync(login, JSON.stringify({
      id: uuid.v4(),
      login,
      password: pwd,
      email,
      company,
      scope
    }))
  }
}

export default UserService
