export type BasePacket = Record<string, unknown>;
export type LogLevels = Record<string, number>;
export type LogFunction<T> = (x: T) => Promise<void>;
export type LogPacket<T, L extends LogLevels, B extends BasePacket> = {
  message: T;
  level: keyof L;
} & B;
export type TransportFunction<T, L extends LogLevels, B extends BasePacket> = (
  packet: LogPacket<T, L, B>,
) => Promise<void>;

export type LoggerCreateOptions<T, L extends LogLevels, B extends BasePacket> = {
  logLevel: keyof L;
  levels: L;
  base: () => B;
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
        const packet: LogPacket<T, L, B> = { ...base(), message, level: levelName };
        await Promise.all(transports.map((fn) => fn(packet)));
      }
    };
  }

  return { ...loggerFns };
}
