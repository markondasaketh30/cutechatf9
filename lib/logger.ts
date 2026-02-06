import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {
        formatters: {
          level: (label) => ({ level: label }),
        },
      }
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
  redact: {
    paths: [
      "authorization",
      "cookie",
      "password",
      "token",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});

export const dbLogger = logger.child({ module: "db" });
export const authLogger = logger.child({ module: "auth" });
export const chatLogger = logger.child({ module: "chat" });
export const apiLogger = logger.child({ module: "api" });
export const emailLogger = logger.child({ module: "email" });

export default logger;
