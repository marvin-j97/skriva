## Comparison to other logging libraries

You can easily recreate a Bunyan-esque JSON logger

```typescript
import { hostname } from "os";
import { createLogger } from "skriva";
import { createConsoleTransport } from "skriva-transport-console";

// Note that, like Winston, skriva follows RFC5424, meaning lower levels are more important
// Bunyan and Pino do it the other way around
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
          return JSON.stringify({
            ...base,
            level: logLevels[level],
            msg: message,
          });
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
// You could wrap the logging functions and support a calling format like:
// logger.info("arrivederci", { lang: "it" });
```

This example shows that the internals are very unopinionated, as the formatting logic is delegated to the transports.
