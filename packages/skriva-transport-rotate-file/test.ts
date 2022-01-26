import { createLogger } from "skriva";

import { createFileRotator } from "./src";

const logLevels = {
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

type LogBaseContext = { timestamp: Date };

const logger = createLogger<string, typeof logLevels, LogBaseContext>({
  context: () => ({ timestamp: new Date() }),
  logLevels,
  level: "debug",
  transports: [
    {
      handler: createFileRotator({
        format: (packet) => `[${packet.level}] ${packet.message}`,
        filename: "logs-%DATE%",
        auditFile: "logs.json",
        maxLogs: "14d",
        size: "1k",
        verbose: true,
        dateFormat: "YYYY-MM-DD",
        extension: ".log",
      }),
    },
  ],
});

(async () => {
  for (;;) {
    logger.info("Hello world");
    logger.debug("Another message");
    logger.error("Oh no");
    logger.warn("Check it out");
    await new Promise((r) => setTimeout(r, 1000));
  }
})();
