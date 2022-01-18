import { BasePacket, LogFunction, LogLevels, LogPacket, TransportFunction } from "./types";

export type LoggerCreateOptions<T, L extends LogLevels, B extends BasePacket> = {
  logLevel: keyof L;
  levels: L;
  base: (message: T) => B;
  transports: Array<TransportFunction<T, L, B>>;
};

export function createLogger<T, L extends LogLevels, B extends BasePacket>(
  opts: LoggerCreateOptions<T, L, B>,
): Record<keyof L, LogFunction<T>> {
  const { logLevel, levels, base, transports } = opts;

  const levelSetting = levels[logLevel];
  const loggerFns: Record<keyof L, LogFunction<T>> = {} as Record<keyof L, LogFunction<T>>;

  for (const [levelName, levelValue] of Object.entries<number>(levels)) {
    loggerFns[levelName as keyof L] = async (message) => {
      if (levelValue >= levelSetting) {
        const packet: LogPacket<T, L, B> = { ...base(message), message, level: levelName };
        await Promise.all(transports.map((fn) => fn(packet)));
      }
    };
  }

  return { ...loggerFns };
}

export * from "./types";
