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

  const loggerFns: Record<keyof L, LogFunction<T>> = {} as Record<keyof L, LogFunction<T>>;

  for (const levelName of Object.keys(logLevels)) {
    loggerFns[levelName as keyof L] = (message) => {
      const packet: LogPacket<T, L, B> = { ...context(message), message, level: levelName };

      for (const x of transports) {
        if (x.level && !checkLevel(logLevels, levelName, x.level)) {
          continue;
        } else if (!x.level && !checkLevel(logLevels, levelName, globalLevel)) {
          continue;
        }

        try {
          const result = x.handler(packet);
          if (result instanceof Promise) {
            result.catch((error) => {
              opts.onError?.(error);
            });
          }
        } catch (error: any) {
          opts.onError?.(error);
        }
      }
    };
  }

  return { ...loggerFns };
}
