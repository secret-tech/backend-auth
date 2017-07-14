const {
	REDIS_HOST,
	REDIS_PORT,
	PORT,
	HTTPS_PORT,
	HTTPS_SERVER,
	FORCE_HTTPS,
	THROTTLER_WHITE_LIST,
	THROTTLER_INTERVAL,
	THROTTLER_MAX,
	THROTTLER_MIN_DIFF,
	JWT_KEY
} = process.env

export default {
	app: {
		port: parseInt(PORT, 10) || 3000,
		httpsPort: parseInt(HTTPS_PORT, 10) || 4000,
		httpsServer: HTTPS_SERVER || 'disabled',
		forceHttps: FORCE_HTTPS || 'disabled'
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
		prefix: 'request_throttler_',
		interval: THROTTLER_INTERVAL || 1000, // time window in milliseconds
		maxInInterval: THROTTLER_MAX || 5, // max number of allowed requests from 1 IP in "interval" time window
		minDifference: THROTTLER_MIN_DIFF || 0, // optional, minimum time between 2 requests from 1 IP
		whiteList: THROTTLER_WHITE_LIST ? THROTTLER_WHITE_LIST.split(',') : [] // requests from these IPs won't be throttled
	}
}
