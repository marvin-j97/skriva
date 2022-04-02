export type BasePacket = Record<string, unknown>;
export type LogLevels = Record<string, number>;
export type LogFunction<T> = (x: T) => void;

export type LevelSetting<L extends LogLevels> = keyof L | (keyof L)[];

export type LogPacket<T, L extends LogLevels, B extends BasePacket> = {
  message: T;
  level: keyof L;
} & B;

export type TransportFunction<T, L extends LogLevels, B extends BasePacket> = (
  packet: LogPacket<T, L, B>,
) => void | Promise<void>;

export type Transport<T, L extends LogLevels, B extends BasePacket> = {
  handler: TransportFunction<T, L, B>;
  level?: LevelSetting<L>;
};

export type Formatter<T, L extends LogLevels, B extends BasePacket, R> = (
  packet: LogPacket<T, L, B>,
) => R;
