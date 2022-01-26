import tap from "tap";

import { createLogger } from "../src";
import { sleep } from "./common";

const logLevels = {
  error: 0,
  warn: 5,
  info: 10,
};

tap.test("should only call transports with appropiate level", async () => {
  const calledSet = new Set<string>();

  const logger = createLogger({
    context: () => ({ timestamp: new Date() }),
    logLevels: logLevels,
    level: "error",
    transports: [
      {
        handler: async () => {
          calledSet.add("error");
        },
        level: "error",
      },
      {
        handler: async () => {
          calledSet.add("warn");
        },
        level: "warn",
      },
      {
        handler: async () => {
          calledSet.add("info");
        },
        level: "info",
      },
    ],
  });

  logger.info("message");

  await sleep(50);

  tap.ok(!calledSet.has("error"));
  tap.ok(!calledSet.has("warn"));
  tap.ok(calledSet.has("info"));

  calledSet.clear();

  logger.warn("message");

  await sleep(50);

  tap.ok(!calledSet.has("error"));
  tap.ok(calledSet.has("warn"));
  tap.ok(calledSet.has("info"));
});
