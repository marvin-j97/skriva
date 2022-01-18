# skriva

From Old Norse _skrifa_, from Proto-Germanic _\*skrībaną_, a late borrowing from Latin _scrībō_ ("write")

## About

Super-unopionionated no-black-magic logger, with zero dependencies, tailored for Typescript usage.

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
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

const logger = createLogger({
  levels: logLevels,
  logLevel: "debug",
  /* ... */
});
```

### Basic console logger

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";

const logLevels = {
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

// createLogger has 3 types that describe what types of logs are being used
// Type 1 is the message type, aka. the data that is being written
// Type 2 is the log level type
// Type 3 is the type of the base context
const logger = createLogger<string, typeof logLevels, {}>({
  base: () => ({}),
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
  base: () => ({ timestamp: new Date() }),
  /* ... */
});
```

### Basic JSON logger

```typescript
import { createLogger } from "skriva";
// Use prebuilt console transport
import { createConsoleTransport } from "skriva-transport-console";

const logLevels = {
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

const logger = createLogger<string, typeof logLevels, { timestamp: Date }>({
  base: () => ({ timestamp: new Date() }),
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
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

const logger = createLogger<
  { microservice: string; text: string },
  typeof logLevels,
  { timestamp: Date }
>({
  base: () => ({ timestamp: new Date() }),
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
  debug: 0,
  info: 10,
  warn: 20,
  error: 30,
};

const colorize: Record<keyof typeof logLevels, Chalk> = {
  debug: chalk.magentaBright,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
};

const logger = createLogger<string, typeof logLevels, { timestamp: Date }>({
  base: () => ({ timestamp: new Date() }),
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

- [Console transport](./packages/skriva-transport-console/README.md) (recommended)
- [Rotating file transport](./packages/skriva-transport-rotate-file/README.md) (recommended)
- [Elasticsearch transport](./packages/skriva-transport-elasticsearch/README.md)
- [Append file transport](./packages/skriva-transport-append-file/README.md) (prefer using rotating file instead)
