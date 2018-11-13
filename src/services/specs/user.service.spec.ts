import { container } from '../../ioc.container';
import { expect } from 'chai';
import { StorageServiceType, StorageService } from '../storage.service';
import { UserServiceType, UserServiceInterface } from '../user.service';

const storageService = container.get<StorageService>(StorageServiceType);
const userService = container.get<UserServiceInterface>(UserServiceType);

describe('userService', () => {
  afterEach(async() => {
    await storageService.flushdb();
  });

  describe('#create', () => {
    it('should create new user', async() => {
      const user = { email: 'test', login: 'test', tenant: 'test', password: 'test', sub: '123' };
      const result = await userService.create(user);

      expect(result).to.be.a('object');
    });
  });

  describe('#listForTenant', () => {
    before(async() => {
      const userOne = { email: 'test', login: 'test', tenant: 'test', password: 'test', sub: '123' };
      const userTwo = { email: 'test1', login: 'test1', tenant: 'test', password: 'test', sub: '321' };
      await userService.create(userOne);
      await userService.create(userTwo);
    });
    
    it('should list users by tenant id', async() => {
      const result = await userService.listForTenant('test');
      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
    });
  });

  describe('#get', () => {
    before(async() => {
      const userData = { email: 'test', login: 'test', tenant: 'test', password: 'test', sub: '123' };
      await userService.create(userData);
    });

    it('should return user', async() => {
      const userStr = await userService.get('test:test');
      const user = JSON.parse(userStr);

      expect(user.login).to.equal('test');
    });
  });
});
