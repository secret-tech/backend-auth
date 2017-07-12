const { REDIS_HOST, REDIS_PORT, PORT, JWT_KEY } = process.env

export default {
	app: {
		port: parseInt(PORT, 10) || 3000
	},
	key_service: {
		expires_seconds: 604800
	},
	jwt: {
		algorithm: 'HS256',
		secret_separator: ':',
		expiration: 60,
		secret: JWT_KEY || 'uZrJ!xe*xN?!;oU.u*;QOSM+|=4C?WH?6eWPcK/6AkIXIVGQguSA*r'
	},
	redis: {
		port: parseInt(REDIS_PORT, 10) || 6379,
		host: REDIS_HOST || 'localhost',
		prefix: 'jincor_auth_'
	},
	throttler: {
		prefix: 'request_rate_limiter_',
		interval: 60000, // time window in milliseconds
		maxInInterval: 5, // max number of allowed requests from 1 IP in "interval" time window
		minDifference: 100, // optional, minimum time between 2 requests from 1 IP
		whiteList: [
			'::ffff:127.0.0.1',
		], // requests from these IPs won't be throttled
	}
}
