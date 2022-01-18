export type BasePacket = Record<string, unknown>;
export type LogLevels = Record<string, number>;
export type LogFunction<T> = (x: T) => void;

export type LogPacket<T, L extends LogLevels, B extends BasePacket> = {
  message: T;
  level: keyof L;
} & B;

export type TransportFunction<T, L extends LogLevels, B extends BasePacket> = (
  packet: LogPacket<T, L, B>,
) => Promise<void>;

export type Formatter<T, L extends LogLevels, B extends BasePacket, R> = (
  packet: LogPacket<T, L, B>,
) => R;
