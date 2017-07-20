import { Router } from 'express'
import TenantController from '../controllers/tenant.controller'

const router: Router = Router()
const controller: TenantController = new TenantController()

router
  .post('/login', controller.login)
  .post('/logout', controller.logout)
  .post('/', controller.create)


export default router
