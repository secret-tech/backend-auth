import express from 'express'

import UserService from '../services/UserService'

const router = express.Router()

/**
 * POST create user
 *
 * TODO: check if this route were called only
 * from our's server(USE JWT for this as well?)
 *
 * Create new user in Redis storage
 * Throw an error if user already exists in DB
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {}          [description]
 * @return {[type]}       [description]
 */
router.post('/', async (req, res) => {
	const { email, company, password, scope } = req.body

	if (!email || !password) {
		return res.status(400).send({
			error: 'email and password are required parameters',
			status: 400
		})
	}

	const result = await UserService.create({ email, password, company, scope })

	res.json(result)
})

export default router
