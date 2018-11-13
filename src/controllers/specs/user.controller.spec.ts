import * as chai from 'chai';
import app from '../../app';
import { container } from '../../ioc.container';
import { UserServiceType, UserServiceInterface } from '../../services/user.service';
import { TenantServiceType, TenantServiceInterface } from '../../services/tenant.service';
import { StorageServiceType, StorageService } from '../../services/storage.service';

const { expect, request } = chai;

const tenantService = container.get<TenantServiceInterface>(TenantServiceType);
const userService = container.get<UserServiceInterface>(UserServiceType);
const storageService = container.get<StorageService>(StorageServiceType);

let postRequest;
let delRequest;
let getRequest;
let token;
let tenant;

describe('Users', () => {
  afterEach(async() => {
    await storageService.flushdb();
  });

  beforeEach(async() => {
    const params = { email: 'test@test.com', password: 'testA6' };
    tenant = await tenantService.create(params);
    token = await tenantService.login(params);
  });

  describe('POST /user', () => {
    before(async() => {
      postRequest = (url: string) => {
        return request(app)
          .post(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token);
      };
    });

    it('should create user', (done) => {
      const params = { email: 'test@test.com', login: 'test', password: 'test', sub: '123' };
      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.not.have.property('passwordHash');
        expect(res.body).to.not.have.property('password');
        done();
      });
    });

    it('should create user when additional fields are present in request', (done) => {
      const params = { employeeId: 'id', email: 'test@test.com', login: 'test', password: 'test', sub: '123' };
      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
    });

    it('should create user when additional fields are present in request', (done) => {
      const params = { employeeId: 'id', email: 'test@test.com', login: 'test', password: 'test', sub: '123', }
      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
    })

    it('should validate email', (done) => {
      const params = { email: 'test.test.com', login: 'test', password: 'test', sub: '123' };

      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(422);

        expect(res.body.error.details[0].message).to.equal('"email" must be a valid email');
        done();
      });
    });

    it('should require email', (done) => {
      const params = { login: 'test', password: 'test', sub: '123' };

      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(422);

        expect(res.body.error.details[0].message).to.equal('"email" is required');
        done();
      });
    });

    it('should require login', (done) => {
      const params = { email: 'test@test.com', password: 'test', sub: '123' };

      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(422);

        expect(res.body.error.details[0].message).to.equal('"login" is required');
        done();
      });
    });

    it('should require password', (done) => {
      const params = { email: 'test@test.com', login: 'test', sub: '123' };

      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(422);

        expect(res.body.error.details[0].message).to.equal('"password" is required');
        done();
      });
    });

    it('should require sub', (done) => {
      const params = { email: 'test@test.com', login: 'test', password: 'test' };

      postRequest('/user').send(params).end((err, res) => {
        expect(res.status).to.equal(422);

        expect(res.body.error.details[0].message).to.equal('"sub" is required');
        done();
      });
    });
  });

  describe('GET /user', () => {

    before(async() => {
      await storageService.flushdb();
      getRequest = (url: string) => {
        return request(app)
          .get(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token);
      };
    });
    /**
     * Issue-62
     * @see https://github.com/secret-tech/backend-auth/issues/62
     */
    it('should show empty list of tenants if tenant doest exist', (done) => {
      getRequest('/user').end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(0);
        done();
      });
    });

    it('should list users for tenant', (done) => {
      const params = { email: 'test', login: 'test', tenant: tenant.id, password: 'test', sub: '123' };
      const params2 = { email: 'test2', login: 'test2', tenant: tenant.id, password: 'test2', sub: '321' };
      userService.create(params).then(() => {
        userService.create(params2).then(() => {
          getRequest('/user').end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            done();
          });
        });
      });
    });


    
  });

  describe('DELETE /user', () => {
    before(async() => {
      delRequest = (url: string) => {
        return request(app)
          .del(url)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + token);
      };
    });

    it('should delete user', (done) => {
      const params = { email: 'test', login: 'test', tenant: tenant.id, password: 'test', sub: '123' };
      const userData = userService.create(params).then((userData) => {
        delRequest(`/user/${userData.login}`).end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.result).to.equal(1);
          done();
        });
      });
    });

    it('should respond with 404 code if login is not found', (done) => {
      delRequest('/user/123').end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should require login', (done) => {
      delRequest('/user/').end((err, res) => {
        expect(res.status).to.equal(404); // 404 because no matching route is found, so validation does not make sense here
        done();
      });
    });
  });
});
