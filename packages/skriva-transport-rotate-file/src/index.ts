// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getStream } from "file-stream-rotator";
import { createReadStream, createWriteStream, unlinkSync } from "fs";
import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";
import zlib from "zlib";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  format: Formatter<T, L, B, string>;
  filename: string;
  frequency?: string;
  verbose?: boolean;
  maxLogs: string;
  auditFile: string;
  size: string;
  gzip?: boolean;
};

export function createFileRotator<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  const stream = getStream({
    filename: opts.filename,
    frequency: opts.frequency || "daily",
    verbose: opts.verbose ?? false,
    max_logs: opts.maxLogs,
    audit_file: opts.auditFile,
    size: opts.size,
  });

  // Snatched from https://github.com/winstonjs/winston-daily-rotate-file
  if (opts.gzip ?? true) {
    stream.on("rotate", (oldFile: string) => {
      // TODO: if oldFile does not exist, return early
      // TODO: if archived file already exists, return early

      const gzip = zlib.createGzip();
      const inp = createReadStream(oldFile);
      const out = createWriteStream(`${oldFile}.gz`);
      inp
        .pipe(gzip)
        .pipe(out)
        .on("finish", function () {
          unlinkSync(oldFile);
        });
    });
  }

  return async (packet) => {
    stream.write(`${opts.format(packet)}\n`);
  };
}
