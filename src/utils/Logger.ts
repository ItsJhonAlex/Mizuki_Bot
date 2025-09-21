import { LogLevel } from '../types';

export class Logger {
    private logLevel: LogLevel;

    constructor() {
        this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const levelEmoji = this.getLevelEmoji(level);
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') : '';
        
        return `${levelEmoji} [${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
    }

    private getLevelEmoji(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR: return '❌';
            case LogLevel.WARN: return '⚠️';
            case LogLevel.INFO: return 'ℹ️';
            case LogLevel.DEBUG: return '🐛';
            default: return '📝';
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, ...args));
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, ...args));
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(this.formatMessage(LogLevel.INFO, message, ...args));
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.log(this.formatMessage(LogLevel.DEBUG, message, ...args));
        }
    }
}
