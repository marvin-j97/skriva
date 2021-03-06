import { createWriteStream, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  path: string;
  format: Formatter<T, L, B, string>;
};

export function createFileAppendTransport<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  mkdirSync(dirname(opts.path), { recursive: true });
  const writer = createWriteStream(resolve(opts.path), {
    flags: "a",
  });

  return async (packet) => {
    writer.write(`${opts.format(packet)}\n`);
  };
}
