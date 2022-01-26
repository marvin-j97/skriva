import { BasePacket, LevelSetting, LogFunction, LogLevels, LogPacket, Transport } from "./types";

export type LoggerCreateOptions<T, L extends LogLevels, B extends BasePacket> = {
  level: LevelSetting<L>;
  logLevels: L;
  context: (message: T) => B;
  transports: Transport<T, L, B>[];
  onError?: (err: Error) => void;
};

function checkLevel<L extends LogLevels>(
  levels: L,
  msgLevel: keyof L,
  setLevel: LevelSetting<L>,
): boolean {
  if (Array.isArray(setLevel)) {
    return setLevel.includes(msgLevel);
  }
  return levels[msgLevel] <= levels[setLevel];
}

export function createLogger<T, L extends LogLevels, B extends BasePacket>(
  opts: LoggerCreateOptions<T, L, B>,
): Record<keyof L, LogFunction<T>> {
  const { level: globalLevel, logLevels, context, transports } = opts;

  const queue: { message: T; levelName: keyof L }[] = [];
  let isProcessing = false;

  async function processQueue(): Promise<void> {
    if (!isProcessing) {
      isProcessing = true;

      do {
        const item = queue.shift();

        if (item) {
          const { message, levelName } = item;
          const packet: LogPacket<T, L, B> = { ...context(message), message, level: levelName };
          await Promise.all(
            transports.map(async (x) => {
              if (x.level && !checkLevel(logLevels, levelName, x.level)) {
                return;
              } else if (!x.level && !checkLevel(logLevels, levelName, globalLevel)) {
                return;
              }
              await x.handler(packet);
            }),
          ).catch((error) => {
            opts.onError?.(error);
          });
        }
      } while (queue.length);

      isProcessing = false;
    }
  }

  const loggerFns: Record<keyof L, LogFunction<T>> = {} as Record<keyof L, LogFunction<T>>;

  for (const levelName of Object.keys(logLevels)) {
    loggerFns[levelName as keyof L] = (message) => {
      queue.push({ message, levelName });
      processQueue();
    };
  }

  return { ...loggerFns };
}
