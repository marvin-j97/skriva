import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  format: Formatter<T, L, B, string>;
};

export function createConsoleTransport<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  return async (packet) => {
    console.error(opts.format(packet));
  };
}
