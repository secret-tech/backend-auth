import { Router } from 'express'
import JWTController from '../controllers/jwt.controller'
import { Auth } from '../middlewares/auth'
import { Response, Request, NextFunction } from 'express'

const router: Router = Router()
const controller: JWTController = new JWTController()

const auth = new Auth()

router.use((req: Request, res: Response, next: NextFunction) => auth.authenticate(req, res, next))

router
  .post('/', controller.create)
  .post('/verify', controller.verify)
  .post('/logout', controller.logout)

export default router
