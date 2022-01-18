import fetch from "node-fetch";
import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";

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
      throw new Error(`Request failed with status ${res.status}: ${await res.text()}`);
    }
  };
}
