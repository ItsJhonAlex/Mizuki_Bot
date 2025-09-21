import winston from 'winston';
import chalk from 'chalk';
import moment from 'moment';
import 'winston-daily-rotate-file';
import { LogLevel } from '../types';

export class Logger {
    private logger: winston.Logger;
    private logLevel: LogLevel;

    constructor() {
        this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
        this.logger = this.createLogger();
    }

    private createLogger(): winston.Logger {
        // Custom format for console output
        const consoleFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                const coloredLevel = this.getColoredLevel(level);
                const coloredTimestamp = chalk.gray(`[${timestamp}]`);
                const coloredMessage = this.getColoredMessage(level, message as string);
                const metaString = Object.keys(meta).length ? chalk.gray(JSON.stringify(meta, null, 2)) : '';
                const stackString = stack ? chalk.red(`\n${stack}`) : '';
                
                return `${coloredTimestamp} ${coloredLevel} ${coloredMessage}${metaString}${stackString}`;
            })
        );

        // Custom format for file output
        const fileFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        return winston.createLogger({
            level: this.logLevel,
            format: fileFormat,
            defaultMeta: { service: 'mizuki-bot' },
            transports: [
                // Console transport with colors
                new winston.transports.Console({
                    format: consoleFormat,
                    level: this.logLevel
                }),
                
                // Daily rotate file for errors
                new winston.transports.DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: fileFormat
                }),
                
                // Daily rotate file for all logs
                new winston.transports.DailyRotateFile({
                    filename: 'logs/combined-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: fileFormat
                })
            ],
            exceptionHandlers: [
                new winston.transports.File({ filename: 'logs/exceptions.log' })
            ],
            rejectionHandlers: [
                new winston.transports.File({ filename: 'logs/rejections.log' })
            ]
        });
    }

    private getColoredLevel(level: string): string {
        switch (level) {
            case 'error':
                return chalk.red.bold('❌ ERROR');
            case 'warn':
                return chalk.yellow.bold('⚠️  WARN ');
            case 'info':
                return chalk.blue.bold('ℹ️  INFO ');
            case 'debug':
                return chalk.magenta.bold('🐛 DEBUG');
            default:
                return chalk.gray.bold('📝 LOG  ');
        }
    }

    private getColoredMessage(level: string, message: string): string {
        switch (level) {
            case 'error':
                return chalk.red(message);
            case 'warn':
                return chalk.yellow(message);
            case 'info':
                return chalk.cyan(message);
            case 'debug':
                return chalk.magenta(message);
            default:
                return chalk.white(message);
        }
    }

    // Public methods
    error(message: string, ...args: any[]): void {
        this.logger.error(message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    // Special methods for Mizuki
    botReady(botName: string, guilds: number, users: number): void {
        this.logger.info(
            chalk.green.bold(`🌙 ${botName} está lista!`) +
            chalk.blue(` Servidores: ${guilds}`) +
            chalk.blue(` | Usuarios: ${users}`)
        );
    }

    commandExecuted(command: string, user: string, guild?: string): void {
        const guildInfo = guild ? chalk.gray(` en ${guild}`) : '';
        this.logger.info(
            chalk.green(`🌙 Comando ejecutado:`) +
            chalk.cyan(` ${command}`) +
            chalk.yellow(` por ${user}`) +
            guildInfo
        );
    }

    userJoined(user: string, guild: string): void {
        this.logger.info(
            chalk.green(`👋 Usuario se unió:`) +
            chalk.cyan(` ${user}`) +
            chalk.gray(` a ${guild}`)
        );
    }

    userLeft(user: string, guild: string): void {
        this.logger.info(
            chalk.red(`👋 Usuario se fue:`) +
            chalk.cyan(` ${user}`) +
            chalk.gray(` de ${guild}`)
        );
    }

    messageDeleted(user: string, channel: string, guild?: string): void {
        const guildInfo = guild ? chalk.gray(` en ${guild}`) : '';
        this.logger.info(
            chalk.yellow(`🗑️  Mensaje eliminado:`) +
            chalk.cyan(` ${user}`) +
            chalk.gray(` en ${channel}`) +
            guildInfo
        );
    }

    // Utility methods
    createSeparator(): void {
        const separator = '='.repeat(60);
        this.logger.info(chalk.gray(separator));
    }

    createHeader(title: string): void {
        this.createSeparator();
        this.logger.info(chalk.blue.bold(`🌙 ${title}`));
        this.createSeparator();
    }
}
