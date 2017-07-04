import { Router } from 'express'
import UserController from '../controllers/user.controller'

const router: Router = Router()
const controller: UserController = new UserController()

router
	.post('/', controller.create)
	.delete('/:login', controller.del)

export default router
