import { Collection, SlashCommandBuilder } from 'discord.js';

// Command interface
export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: any) => Promise<void>;
    cooldown?: number;
    permissions?: string[];
    ownerOnly?: boolean;
}

// Event interface
export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void>;
}

// Bot client interface
declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

// Configuration interface
export interface BotConfig {
    token: string;
    clientId: string;
    guildId?: string;
    prefix: string;
    ownerId: string;
    logLevel: string;
}

// Logger levels
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}
