import { createLogger } from "../packages/skriva";
import { hostname } from "os";
import { createConsoleTransport } from "../packages/skriva-transport-console";

const logLevels = {
  fatal: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40,
  trace: 50,
};

const logger = createLogger<
  string | { msg: string; [key: string]: unknown },
  typeof logLevels,
  Record<string, unknown>
>({
  context: () => ({ name: "myapp", time: new Date(), hostname: hostname(), pid: process.pid }),
  logLevels,
  level: "trace",
  transports: [
    {
      fn: createConsoleTransport({
        format: ({ level, message, ...base }) => {
          if (typeof message === "string") {
            return JSON.stringify({
              ...base,
              level: logLevels[level],
              msg: message,
            });
          }
          return JSON.stringify({
            ...base,
            level: logLevels[level],
            ...message,
          });
        },
      }),
    },
  ],
});

logger.info("hello world");
logger.info({
  msg: "arrivederci",
  lang: "it",
});
