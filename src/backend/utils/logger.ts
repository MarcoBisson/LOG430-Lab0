import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true,
      ignore: 'pid,hostname',
    },
  },
});

export default logger;

export function createControllerLogger(moduleName: string) {
  return {
    info: (msg: string, obj = {}) => logger.info({ ...obj, msg: `[${moduleName}] ${msg}` }),
    warn: (msg: string, obj = {}) => logger.warn({ ...obj, msg: `[${moduleName}] ${msg}` }),
    error: (msg: string, obj = {}) => logger.error({ ...obj, msg: `[${moduleName}] ${msg}` }),
  };
}
