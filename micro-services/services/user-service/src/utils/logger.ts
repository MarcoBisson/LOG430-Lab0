import winston from 'winston';

// Configuration du logger
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Logger principal pour l'application
export const createAppLogger = (service: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service },
    transports: [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      }),
    ],
  });
};

// Logger pour les contrôleurs
export const createControllerLogger = (controller: string) => {
  return winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { 
      service: 'auth-service',
      controller 
    },
    transports: [
      new winston.transports.File({ 
        filename: 'logs/controllers.log' 
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ],
  });
};

// Logger pour les erreurs
export const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});
