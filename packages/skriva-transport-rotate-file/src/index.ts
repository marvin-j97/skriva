// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getStream } from "file-stream-rotator";
import { createReadStream, createWriteStream, existsSync, unlinkSync } from "fs";
import type { BasePacket, Formatter, LogLevels, TransportFunction } from "skriva";
import zlib from "zlib";

type Options<T, L extends LogLevels, B extends BasePacket> = {
  format: Formatter<T, L, B, string>;
  /**
   * Whether to gzip old log files (defaults to true)
   */
  gzip?: boolean;

  //
  // Filestream options (taken from https://www.npmjs.com/package/file-stream-rotator)
  //

  /**
   * Filename including full path used by the stream
   */
  filename: string;
  /**
   * How often to rotate. Options are 'daily', 'custom' and 'test'. 'test' rotates every minute. If frequency is set to none of the above, a YYYYMMDD string will be added to the end of the filename.
   */
  frequency?: string;
  /**
   * If set, it will log to STDOUT when it rotates files and name of log file. Default is false.
   */
  verbose?: boolean;
  /**
   * Max number of logs to keep. If not set, it won't remove past logs. It uses its own log audit file to keep track of the log files in a json format. It won't delete any file not contained in it. It can be a number of files or number of days. If using days, add 'd' as the suffix.
   */
  maxLogs: string;
  /**
   * Location to store the log audit file. If not set, it will be stored in the root of the application.
   */
  auditFile: string;
  /**
   * Max size of the file after which it will rotate. It can be combined with frequency or date format. The size units are 'k', 'm' and 'g'. Units need to directly follow a number e.g. 1g, 100m, 20k.
   */
  size: string;
  /**
   *`Format as used in moment.js http://momentjs.com/docs/#/displaying/format/. The result is used to replace the '%DATE%' placeholder in the filename. If using 'custom' frequency, it is used to trigger file rotation when the string representation changes.
   */
  dateFormat?: string;
  /**
   * File extension to be appended to the filename. This is useful when using size restrictions as the rotation adds a count (1,2,3,4,...) at the end of the filename when the required size is met.
   */
  extension?: string;
  /**
   * Create a tailable symlink to the current active log file. Defaults to false
   */
  createSymlink?: boolean;
  /**
   * Name to use when creating the symbolic link. Defaults to 'current.log'
   */
  symlinkName?: string;
  /**
   * Use specified hashing algorithm for audit. Defaults to 'md5'. Use 'sha256' for FIPS compliance.
   */
  auditHashType?: "md5" | "sha256";
};

export function createFileRotator<T, L extends LogLevels, B extends BasePacket>(
  opts: Options<T, L, B>,
): TransportFunction<T, L, B> {
  const stream = getStream({
    filename: opts.filename,
    frequency: opts.frequency,
    verbose: opts.verbose ?? false,
    max_logs: opts.maxLogs,
    audit_file: opts.auditFile,
    size: opts.size,
    date_format: opts.dateFormat,
    extension: opts.extension,
    create_symlink: opts.createSymlink,
    symlink_name: opts.symlinkName,
    audit_hash_type: opts.auditHashType,
  });

  // Snatched from https://github.com/winstonjs/winston-daily-rotate-file
  if (opts.gzip ?? true) {
    stream.on("rotate", (oldFile: string) => {
      if (!existsSync(oldFile)) {
        return;
      }

      const zipFile = `${oldFile}.gz`;

      if (existsSync(zipFile)) {
        return;
      }

      const gzip = zlib.createGzip();
      const inp = createReadStream(oldFile);
      const out = createWriteStream(zipFile);
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
