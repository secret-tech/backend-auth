import { Router } from 'express'
import SessionController from '../controllers/session.controller'

const router: Router = Router()
const controller: SessionController = new SessionController()

router
  .get('/:sessionKey', controller.view);

export default router
