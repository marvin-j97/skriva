import type { BasePacket, LogLevels, LogPacket, TransportFunction } from "../../logger/src";
import fetch from "node-fetch";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  url: string;
  index: string;
  format: (packet: LogPacket<T, L, B>) => BasePacket;
  // id?: (packet: LogPacket<T, L, B>) => string;
};

export function createElasticsearchTransport<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  return async (packet) => {
    try {
      const res = await fetch(`${opts.url}/${opts.index}/_doc/`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(opts.format(packet)),
      });
      if (!res.ok) {
        console.error(new Error(await res.text()));
      }
    } catch (error) {
      console.error(error);
    }
  };
}
