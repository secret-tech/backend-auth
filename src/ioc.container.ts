import { Container } from 'inversify'
import { TenantServiceInterface, TenantService, TenantServiceType } from './services/tenant.service'
import { StorageServiceType, StorageService, RedisService } from './services/storage.service'
import { KeyServiceType, KeyServiceInterface, KeyService } from './services/key.service'
import { JWTServiceInterface, JWTServiceType, JWTService } from './services/jwt.service'
import { JWTController } from './controllers/jwt.controller'
import { TenantController } from './controllers/tenant.controller'
import { UserController } from './controllers/user.controller'
import { interfaces, TYPE } from 'inversify-express-utils'
import { UserService, UserServiceInterface, UserServiceType } from './services/user.service';
import { Auth } from './middlewares/auth'
import * as express from 'express'

let container = new Container()

container.bind<KeyServiceInterface>(KeyServiceType).to(KeyService)
container.bind<JWTServiceInterface>(JWTServiceType).to(JWTService)

container.bind<StorageService>(StorageServiceType).to(RedisService)
container.bind<TenantServiceInterface>(TenantServiceType).to(TenantService)
container.bind<UserServiceInterface>(UserServiceType).to(UserService)

const auth = new Auth()
container.bind<express.RequestHandler>('AuthMiddleware').toConstantValue((req: any, res: any, next: any) => auth.authenticate(req, res, next))
container.bind<interfaces.Controller>(TYPE.Controller).to(JWTController).whenTargetNamed('JWTController')
container.bind<interfaces.Controller>(TYPE.Controller).to(TenantController).whenTargetNamed('TenantController')
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed('UserController')

export { container }