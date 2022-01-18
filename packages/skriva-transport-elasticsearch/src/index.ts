import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";
import fetch from "node-fetch";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  url: string;
  index: string;
  format: Formatter<T, L, B, BasePacket>;
  getId?: Formatter<T, L, B, string>;
};

export function createElasticsearchTransport<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  return async (packet) => {
    try {
      const id = opts?.getId?.(packet) || "";
      const url = id ? `${opts.url}/${opts.index}/_doc/${id}` : `${opts.url}/${opts.index}/_doc/`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: id ? "PUT" : "POST",
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
