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
		host: REDIS_HOST || 'localhost'
	}
}
