// Logger Utility
// Centralized logging system with different log levels and optional analytics integration

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment: boolean = __DEV__;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100; // Keep last 100 logs in memory

  /**
   * Log debug information (only in development)
   */
  debug(message: string, data?: any, context?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
      console.log(`[DEBUG] ${context ? `[${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log general information
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
    if (this.isDevelopment) {
      console.info(`[INFO] ${context ? `[${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
    console.warn(`[WARN] ${context ? `[${context}]` : ''} ${message}`, data || '');
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error | any, context?: string): void {
    this.log('error', message, error, context);
    console.error(`[ERROR] ${context ? `[${context}]` : ''} ${message}`, error || '');

    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
    // this.reportToErrorService(message, error, context);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get all logs (useful for debugging)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON (for debugging or sending to support)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Log Spotify-related events
   */
  spotify = {
    authStart: () => this.info('Spotify authentication started', undefined, 'Spotify'),
    authSuccess: (userId: string) => this.info('Spotify authentication successful', { userId }, 'Spotify'),
    authError: (error: Error) => this.error('Spotify authentication failed', error, 'Spotify'),
    dataFetched: (dataType: string) => this.info(`Spotify ${dataType} fetched`, undefined, 'Spotify'),
    dataError: (dataType: string, error: Error) => this.error(`Failed to fetch Spotify ${dataType}`, error, 'Spotify'),
  };

  /**
   * Log navigation events
   */
  navigation = {
    navigate: (screen: string) => this.debug(`Navigated to ${screen}`, undefined, 'Navigation'),
    back: () => this.debug('Navigated back', undefined, 'Navigation'),
  };

  /**
   * Log user actions
   */
  user = {
    action: (action: string, data?: any) => this.info(`User action: ${action}`, data, 'User'),
    profileUpdate: (userId: string) => this.info('Profile updated', { userId }, 'User'),
    error: (action: string, error: Error) => this.error(`User action failed: ${action}`, error, 'User'),
  };

  /**
   * Log API calls
   */
  api = {
    request: (endpoint: string, method: string) =>
      this.debug(`API ${method} request`, { endpoint }, 'API'),
    success: (endpoint: string, status: number) =>
      this.debug(`API request successful`, { endpoint, status }, 'API'),
    error: (endpoint: string, error: Error) =>
      this.error(`API request failed`, { endpoint, error }, 'API'),
  };
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };
