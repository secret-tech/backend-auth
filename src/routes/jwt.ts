import { Router } from 'express'
import JWTController from '../controllers/jwt.controller'

const router: Router = Router()
const controller: JWTController = new JWTController()

router
  .post('/', controller.create)
  .post('/verify', controller.verify)
  .post('/logout', controller.logout)

export default router
