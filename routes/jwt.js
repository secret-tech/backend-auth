import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt-nodejs'

import JWT from '../utils/jwt'
import KeyService from '../services/KeyService'
import UserService from '../services/UserService'

const router = express.Router()
/**
 * POST login
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var params [description]
 * @return {[type]}       [description]
 */
router.post('/', async (req, res, next) => {
  try {
    const { login, password, deviceId } = req.body

    if (!login || !password || !deviceId) {
      return res.status(400).send({
        error: 'login, password and deviceId are required parameters',
        status: 400
      })
    }

    const userStr = await UserService.get(login)

    if (!userStr) {
      return res.status(404).send({
        error: 'User does not exist',
        status: 404
      })
    }

    const user = JSON.parse(userStr)
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if(!passwordMatch) {
      return res.status(403).send({
        error: 'Incorrect password',
        status: 403
      })
    }

    const token = await KeyService.set(user, deviceId)

    res.status(200).send({
      accessToken: token
    })

  } catch(e) {
    next(e)
  }
})

/**
 * DELETE
 * Perform logout action
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var sessionKey [description]
 * @return {[type]}       [description]
 */
router.delete('/:sessionKey', async (req, res, next) => {
  try {
    const { sessionKey }  = req.params

    if (!sessionKey) {
      return res.status(400).send({
        error: 'sessionKey is a required parameter'
      })
    }

    const result = await KeyService.delete(sessionKey)

    return result ? res.status(204).send() : res.status(404).send()

  } catch(e) {
    next(e)
  }
})

/**
 * POST
 * Verify token
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {	var        token [description]
 * @return {[type]}       [description]
 */
router.post('/verify', (req, res) => {
	const { token } = req.body
	const decoded = jwt.decode(token)

	res.send(JWT.verify(token, decoded.jti))
});


export default router
