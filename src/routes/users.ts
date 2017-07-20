import { Router } from 'express'
import UserController from '../controllers/user.controller'
import { Auth } from '../middlewares/auth'
import { Response, Request, NextFunction } from 'express'

const router: Router = Router()
const controller: UserController = new UserController()

const auth = new Auth()

router.use((req: Request, res: Response, next: NextFunction) => auth.authenticate(req, res, next))

router
	.post('/', controller.create)
	.delete('/:login', controller.del)

export default router
