import { Router } from 'express'
import JWTController from '../controllers/jwt.controller'

const router: Router = Router()
const controller: JWTController = new JWTController()

router
  .post('/', controller.create)
  .delete('/:sessionKey', controller.delete)
  .post('/verify', controller.verify)

export default router
