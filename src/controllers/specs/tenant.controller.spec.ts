import * as chai from 'chai';
import app from '../../app';
import IpWhiteListFilter from '../../middlewares/ip.whitelist';
import MaintainTenantFilter from '../../middlewares/maintain.tenant.or.whitelist';
import { container } from '../../ioc.container';
import { StorageServiceType, StorageService } from '../../services/storage.service';
import { TenantServiceType, TenantServiceInterface } from '../../services/tenant.service';
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';

chai.use(require('chai-http'));
const { expect, request } = chai;

const tenantService = container.get<TenantServiceInterface>(TenantServiceType);
const storageService = container.get<StorageService>(StorageServiceType);

describe('Tenants', () => {
  afterEach(async() => {
    await storageService.flushdb();
  });

  describe('POST /tenant', () => {
    it('should create tenant', (done) => {
      const params = { email: 'test@test.com', password: 'testA6' };
      request(app).post('/tenant').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.email).to.equal('test@test.com');
        expect(res.body.login).to.equal('tenant:test@test.com');
        expect(res.body).to.have.property('id');
        expect(res.body).to.not.have.property('passwordHash');
        expect(res.body).to.not.have.property('password');
        done();
      });
    });

    it('should not create tenant when email already exists', (done) => {
      const params = { email: 'test@test.com', password: 'testA6' };
      request(app).post('/tenant').set('Accept', 'application/json').send(params).end((err, res) => {
        request(app).post('/tenant').set('Accept', 'application/json').send(params).end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.error).to.equal('This tenant\'s email already exists');
          done();
        });
      });
    });

    it('should require email', (done) => {
      request(app).post('/tenant').set('Accept', 'application/json').send({ password: 'testA6' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"email" is required');
        done();
      });
    });

    it('should validate email ', (done) => {
      const params = { email: 'test.test.com', password: 'test' };

      request(app).post('/tenant').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"email" must be a valid email');
        done();
      });
    });

    it('should require password', (done) => {
      request(app).post('/tenant').set('Accept', 'application/json').send({ email: 'test@test.com' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" is required');
        done();
      });
    });

    it('should validate password length', (done) => {
      request(app).post('/tenant').set('Accept', 'application/json').send({ email: 'test@test.com', password: 'test' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" length must be at least 6 characters long');
        done();
      });
    });

    it('should validate password format', (done) => {
      request(app).post('/tenant').set('Accept', 'application/json').send({ email: 'test@test.com', password: 'test12' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" with value "test12" fails to match the required pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,}$/');
        done();
      });
    });

    it('should use tenant IP whitelist', (done) => {
      container.rebind<express.RequestHandler>('CreateTenantValidation').toConstantValue(
        (req: any, res: any, next: any) => (new MaintainTenantFilter(new IpWhiteListFilter([]))).filter(req, res, next)
      );

      // create new app with new TenantIpWhiteList binding.
      const testApp = new InversifyExpressServer(container).build();

      request(testApp).post('/tenant').set('Accept', 'application/json').send({ email: 'test@test.com', password: 'test12' }).end((err, res) => {
        expect(res.status).to.equal(403);
        done();
      });
    });
  });

  describe('POST /tenant/login', () => {
    it('should authenticate tenant', (done) => {
      const tenant = {email: 'test@test.com', password: 'testA6' };
      tenantService.create(tenant).then(() => {
        request(app).post('/tenant/login').set('Accept', 'application/json').send(tenant).end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('accessToken');
          done();
        });
      });
    });

    it('should not authenticate tenant with incorrect password', (done) => {
      const tenant = {email: 'test@test.com', password: 'testA6' };
      tenantService.create(tenant).then(() => {
        const params = {email: 'test@test.com', password: 'testA61' };
        request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body.error).to.equal('Password is incorrect');
          done();
        });
      });
    });

    it('should not authenticate tenant with incorrect email', (done) => {
      const tenant = { email: 'test@test.com', password: 'test' };
      tenantService.create(tenant).then(() => {
        const params = { email: 'test1@test.com', password: 'testA6' };
        request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
          expect(res.status).to.equal(500);
          expect(res.body.error).to.equal('Tenant is not found');
          done();
        });
      });
    });

    it('should require email', (done) => {
      request(app).post('/tenant/login').set('Accept', 'application/json').send({ password: 'testA6' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"email" is required');
        done();
      });
    });

    it('should validate email ', (done) => {
      const params = { email: 'test.test.com', password: 'test' };

      request(app).post('/tenant/login').set('Accept', 'application/json').send(params).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"email" must be a valid email');
        done();
      });
    });

    it('should require password', (done) => {
      request(app).post('/tenant/login').set('Accept', 'application/json').send({ email: 'test@test.com' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" is required');
        done();
      });
    });

    it('should validate password length', (done) => {
      request(app).post('/tenant/login').set('Accept', 'application/json').send({ email: 'test@test.com', password: 'test' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" length must be at least 6 characters long');
        done();
      });
    });

    it('should validate password format', (done) => {
      request(app).post('/tenant/login').set('Accept', 'application/json').send({ email: 'test@test.com', password: 'test12' }).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"password" with value "test12" fails to match the required pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,}$/');
        done();
      });
    });
  });

  describe('POST /tenant/logout', () => {
    it('should logout', (done) => {
      const tenant = {email: 'test@test.com', password: 'test'};
      tenantService.create(tenant).then(() => {
        tenantService.login(tenant).then((token) => {
          request(app).post('/tenant/logout').set('Accept', 'application/json').send({token}).end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.result).to.equal(1);
            done();
          });
        });
      });
    });

    it('should respond with error for incorrect token', (done) => {
      const tenant = {email: 'test@test.com', password: 'test'};
      tenantService.create(tenant).then(() => {
        tenantService.login(tenant).then((token) => {
          request(app).post('/tenant/logout').set('Accept', 'application/json').send({token: token + '1'}).end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });
      });
    });

    it('should require token', (done) => {
      request(app).post('/tenant/logout').set('Accept', 'application/json').send({}).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"token" is required');
        done();
      });
    });
  });

  describe('POST /tenant/verify', () => {
    it('should verify valid token', (done) => {
      const tenant = {email: 'test@test.com', password: 'test'};
      tenantService.create(tenant).then(() => {
        tenantService.login(tenant).then((token) => {
          request(app).post('/tenant/verify').set('Accept', 'application/json').send({token}).end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.decoded).to.be.a('object');
            done();
          });
        });
      });
    });

    it('should respond with error for incorrect token', (done) => {
      const tenant = {email: 'test@test.com', password: 'test'};
      tenantService.create(tenant).then(() => {
        tenantService.login(tenant).then((token) => {
          request(app).post('/tenant/verify').set('Accept', 'application/json').send({token: token + '1'}).end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });
      });
    });

    it('should require token', (done) => {
      request(app).post('/tenant/verify').set('Accept', 'application/json').send({}).end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body.error.details[0].message).to.equal('"token" is required');
        done();
      });
    });
  });
});
