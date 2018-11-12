import * as path from 'path';
import app from '../app';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import config from '../config';

/**
 * Create HTTP server.
 */
const httpServer = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(config.app.port);

const defaultTlsConfig = {
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'DHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-SHA256',
    'DHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'DHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES256-SHA256',
    'DHE-RSA-AES256-SHA256',
    'HIGH',
    '!aNULL',
    '!eNULL',
    '!EXPORT',
    '!DES',
    '!RC4',
    '!MD5',
    '!PSK',
    '!SRP',
    '!CAMELLIA'
  ].join(':'),
  dhparam: '2048',
  secureProtocol: 'TLSv1_2_method',
  honorCipherOrder: true
};

if (config.app.httpsServer === 'enabled') {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, '/auth.crt')),
    ...defaultTlsConfig
  };
  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(config.app.httpsPort);
}

if (config.tenant.maintainTlsPem) {
  const tlsFile = fs.readFileSync(config.tenant.maintainTlsPem);
  const httpsOptions = {
    key: tlsFile,
    cert: tlsFile,
    ca: [ fs.readFileSync(config.tenant.maintainTlsCa) ],
    // TODO: crl
    requestCert: true,
    rejectUnauthorized: true,
    ...defaultTlsConfig
  };
  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(config.tenant.maintainTlsPort);
}
