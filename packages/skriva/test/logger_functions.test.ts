import tap from "tap";

import { createLogger } from "../src";

const logLevels = {
  error: 50,
  info: 100,
};

tap.test("should create log functions for levels", async () => {
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

  logger.error("test");
  logger.info("test");

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

  logger.error("test");
  logger.info("test");

  tap.ok(!calledSet.has("error"));
  tap.ok(calledSet.has("info"));
  tap.equal(calledCount, 1);
});

tap.test("Should continue with error", async () => {
  const logger = createLogger<string, typeof logLevels, {}>({
    base: () => ({ timestamp: new Date() }),
    levels: logLevels,
    logLevel: "error",
    transports: [
      async () => {
        throw new Error("Help");
      },
    ],
  });

  logger.info("test");
});

tap.test("should call onError", async () => {
  let error: string = "";

  const logger = createLogger<string, typeof logLevels, {}>({
    base: () => ({ timestamp: new Date() }),
    levels: logLevels,
    logLevel: "error",
    transports: [
      async () => {
        throw new Error("Help");
      },
    ],
    onError: (e) => (error = e.message),
  });

  logger.info("test");

  // Need to sleep, because onError is a callback
  await new Promise((r) => setTimeout(r, 500));

  tap.equal(error, "Help");
});
