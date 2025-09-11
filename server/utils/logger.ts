/**
 * Simple logger utility for server-side logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private logLevel: LogLevel = "info";

  constructor() {
    // Set log level from environment variable if available
    const envLogLevel = process.env.LOG_LEVEL as LogLevel;
    if (
      envLogLevel &&
      ["debug", "info", "warn", "error"].includes(envLogLevel)
    ) {
      this.logLevel = envLogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

export const logger = new Logger();
