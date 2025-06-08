import * as winston from 'winston'

const { combine, printf, splat, timestamp } = winston.format

// format the common part of the logs
const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level} :\t ${message}`
})

// format of the log message
const combined = combine(
  splat(),
  timestamp({ format: 'YYYY-MM-DD, HH:mm:ss:SSS' }),
  myFormat
)

// declare logger
const logger = winston.createLogger({
  format: combined,
  transports: [
    //
    // - Write all logs with importance level of `warn` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: './logs/error.log', level: 'warn' }),
    new winston.transports.File({ filename: './logs/combined.log', level: 'http' })
  ]
})

if (['debug', 'dev'].includes(process.env.NODE_ENV)) {
  logger.add(new winston.transports.Console({ format: combined, level: 'http' }))
}

// declare logger
const dbLogger = winston.createLogger({
  format: combined,
  transports: [
    new winston.transports.File({ filename: './logs/db.log' })
  ]
})

if (['debug', 'dev'].includes(process.env.NODE_ENV)) {
  dbLogger.add(new winston.transports.Console({ format: combined }))
}

export { logger, dbLogger }
