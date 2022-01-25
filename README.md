# skriva

[![Node.js CI](https://github.com/marvin-j97/skriva/actions/workflows/node.js.yml/badge.svg)](https://github.com/marvin-j97/skriva/actions/workflows/node.js.yml)

From Old Norse _skrifa_, from Proto-Germanic _\*skrībaną_, a late borrowing from Latin _scrībō_ ("write")

## About

Super-unopionionated no-black-magic logger, with zero dependencies, tailored for Typescript usage.

Like other logging libraries, multiple transports with custom logging levels are supported.

## Install

```bash
npm i skriva
yarn add skriva
```

## Examples

### Define log levels

```typescript
// Lower value = more important
const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
};

const logger = createLogger({
  levels: logLevels,
  // Setting to 'info' will print error, warn, info in this case
  logLevel: "info",
  /* ... */
});

const logger1 = createLogger({
  levels: logLevels,
  // Setting to an array works like a whitelist, so in this case ONLY info will be printed
  logLevel: ["info"],
  /* ... */
});
```

### Basic console logger

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
};

// createLogger has 3 types that describe what types of logs are being used
// Type 1 is the message type, aka. the data that is being written
// Type 2 is the log level type
// Type 3 is the type of the base context
const logger = createLogger<string, typeof logLevels, {}>({
  context: () => ({}),
  levels: logLevels,
  logLevel: "debug",
  transports: [
    // Transports receive an object (packet) containing:
    // - the message
    // - the log level
    // - the base context (merged into the object)
    createConsoleTransport({
      format: ({ message }) => message,
    }),
  ],
});

// logger is fully type-safe, containing your custom log levels as functions
logger.info("This is a log");
// -> This is a log
```

### Base context

```typescript
const logger = createLogger({
  // Adds timestamp to every log
  // The base context function is executed for every received log message
  context: () => ({ timestamp: new Date() }),
  /* ... */
});
```

### Basic JSON logger

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
};

const logger = createLogger<string, typeof logLevels, { timestamp: Date }>({
  context: () => ({ timestamp: new Date() }),
  levels: logLevels,
  logLevel: "debug",
  transports: [
    createConsoleTransport({
      format: (packet) => JSON.stringify(packet),
    }),
  ],
});

logger.info("This is a log");
// -> {"timestamp":"2022-01-18T20:27:32.389Z","message":"This is a log","level":"info"}
```

### More complex logger

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
};

const logger = createLogger<
  { microservice: string; text: string },
  typeof logLevels,
  { timestamp: Date }
>({
  context: () => ({ timestamp: new Date() }),
  levels: logLevels,
  logLevel: "debug",
  transports: [
    createConsoleTransport({
      format: ({ message, ...rest }) => JSON.stringify({ ...message, ...rest }),
    }),
  ],
});

logger.error({
  microservice: "db",
  text: "i had an error",
});
// -> {"microservice":"db","message":"i had an error","timestamp":"2022-01-18T20:31:10.553Z","level":"error"}
```

### Handle errors

```typescript
import { createLogger } from "skriva";

const logger = createLogger({
  /* ... */
  onError: (error) => {
    console.error("Logging error");
    sendMessageToSlack(error);
  },
});
```

### Console logger with colours

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";
import chalk from "chalk";

const logLevels = {
  error: 0,
  warn: 10,
  info: 20,
  debug: 30,
};

const colorize: Record<keyof typeof logLevels, Chalk> = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.green,
  debug: chalk.magentaBright,
};

const logger = createLogger<string, typeof logLevels, { timestamp: Date }>({
  context: () => ({ timestamp: new Date() }),
  levels: logLevels,
  logLevel: "debug",
  transports: [
    createConsoleTransport({
      format: ({ timestamp, level, message }) =>
        `${chalk.grey(timestamp.toISOString())} ${colorize[level](level)} ${message}`,
    }),
  ],
});

logger.info("Hello world");
logger.debug("Another message");
logger.error("Oh no");
logger.warn("Warning");
```

## Transports

- [Console transport](./packages/skriva-transport-console) (recommended)
- [Rotating file transport](./packages/skriva-transport-rotate-file) (recommended)
- [Elasticsearch transport](./packages/skriva-transport-elasticsearch)
- [Append file transport](./packages/skriva-transport-append-file) (prefer using rotating file instead)
