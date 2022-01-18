import tap from "tap";

import { createLogger } from "../src";

const logLevels = {
  info: 50,
  error: 100,
};

tap.test("should create log functions for levels", async () => {
  const calledSet = new Set<string>();
  let calledCount = 0;

  const logger = createLogger<string, typeof logLevels, {}>({
    base: () => ({ timestamp: new Date() }),
    levels: logLevels,
    logLevel: "info",
    transports: [
      async (packet) => {
        calledSet.add(packet.level);
        calledCount++;
      },
    ],
  });

  tap.equal(typeof logger.error, "function");
  tap.equal(typeof logger.info, "function");
  tap.equal(Object.keys(logger).length, 2);

  await logger.error("test");
  await logger.info("test");

  tap.ok(calledSet.has("error"));
  tap.ok(calledSet.has("info"));
  tap.equal(calledCount, 2);
});

tap.test("should only use chosen levels", async () => {
  const calledSet = new Set<string>();
  let calledCount = 0;

  const logger = createLogger<string, typeof logLevels, {}>({
    base: () => ({ timestamp: new Date() }),
    levels: logLevels,
    logLevel: "error",
    transports: [
      async (packet) => {
        calledSet.add(packet.level);
        calledCount++;
      },
    ],
  });

  tap.equal(typeof logger.error, "function");
  tap.equal(typeof logger.info, "function");
  tap.equal(Object.keys(logger).length, 2);

  await logger.error("test");
  await logger.info("test");

  tap.ok(calledSet.has("error"));
  tap.ok(!calledSet.has("info"));
  tap.equal(calledCount, 1);
});
