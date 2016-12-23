import redis from 'redis'
import Promise from 'bluebird'
import uuid from 'node-uuid'
import bcrypt from 'bcrypt-nodejs'

import config from '../config'

const { redis: { port, host } } = config
const client = Promise.promisifyAll(redis.createClient(port, host))

export default {
  // Redis client
  client,

  // Retrieve a user by it's login
  get(login) {
    return this.client.getAsync(login)
  },

  // Create new user
  create(userData) {
    const { email, company, password } = userData

  	if (!email || !password) {
  		return false
  	}

  	const pwd = bcrypt.hashSync(password)
    const login = `${company}:${email}`

  	return this.client.setAsync(login, JSON.stringify({
  		id: uuid.v4(),
  		login,
  		password: pwd,
  		email,
  		company
  	}))
  }
}
