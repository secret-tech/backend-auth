import { expect } from 'chai';
import { StorageServiceType, StorageService } from '../storage.service';
import { container } from '../../ioc.container';

const storageService = container.get<StorageService>(StorageServiceType);

describe('storageService', () => {
  afterEach(async() => {
    await storageService.flushdb();
  });

  describe('#set', () => {
    it('should return "OK"', async() => {
      const result = await storageService.set('key', 'value');
      expect(result).to.equal('OK');
    });
  });

  describe('#get', () => {
    beforeEach(async() => {
      await storageService.set('key', 'value');
    });

    it('should return value', async() => {
      const value = await storageService.get('key');
      expect(value).to.equal('value');
    });

    it('should return null', async() => {
      const value = await storageService.get('wrongKey');
      expect(value).to.equal(null);
    });
  });

  describe('#mget', () => {
    beforeEach(async() => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');
      console.log();
    });

    it('should return value', async() => {
      const value = await storageService.mget(['jincor_auth_key1', 'jincor_auth_key2']);
      expect(value).to.be.an('array');
      expect(value.length).to.equal(2);
      expect(value[0]).to.equal('value1');
      expect(value[1]).to.equal('value2');
    });

    it('should return empty array', async() => {
      const value = await storageService.mget(['wrongKey']);
      expect(value[0]).to.equal(null);
    });
  });

  describe('#keys', () => {
    beforeEach(async() => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');
    });

    it('should return array of keys', async() => {
      const value = await storageService.keys('*key*');
      expect(value).to.be.an('array');
      expect(value.length).to.equal(2);
    });

    it('should return empty array', async() => {
      const value = await storageService.keys('*wrong*');
      expect(value).to.be.an('array');
      expect(value.length).to.equal(0);
    });
  });

  describe('#expire', () => {
    beforeEach(async() => {
      await storageService.set('key', 'value');
    });

    it('should return 1', async() => {
      const result = await storageService.expire('key', 50);
      expect(result).to.equal(1);
    });

    it('should return 0', async() => {
      const result = await storageService.expire('wrongKey', 50);
      expect(result).to.equal(0);
    });
  });

  describe('#del', () => {
    beforeEach(async() => {
      await storageService.set('key', 'value');
    });

    it('should return 1', async() => {
      const result = await storageService.del('key');
      expect(result).to.equal(1);
    });

    it('should return 0', async() => {
      const result = await storageService.del('wrongKey');
      expect(result).to.equal(0);
    });
  });

  describe('#scan', () => {
    beforeEach(async() => {
      await storageService.flushdb();
      await storageService.set('key1', 'value');
      await storageService.set('key2', 'value');
    });

    it('should find 2 keys and return 0 cursor', async() => {
      const result = await storageService.scan('0', '*key*');
      expect(result[0]).to.equal('0');
      expect(result[1].length).to.equal(2);
    });
  });
});
