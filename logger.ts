import winston from 'winston';

export default winston.createLogger({
	transports: [
		new winston.transports.Console({
			level: `info`,
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		}),
		new winston.transports.File({ filename: `./logs/actions.log`, level: `info` }),
		new winston.transports.File({ filename: `./logs/errors.log`, level: `error` })
	],
});