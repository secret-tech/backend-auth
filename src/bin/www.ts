import app from '../app'
import * as http from 'http'
import config from '../config'

/**
 * Get port from environment and store in Express.
 */
app.set('port', config.app.port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(config.app.port)
