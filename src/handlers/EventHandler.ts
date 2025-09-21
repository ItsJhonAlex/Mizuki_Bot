import { Client, Events } from 'discord.js';
import { Event } from '../types';
import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

export class EventHandler {
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    async loadEvents(client: Client): Promise<void> {
        const eventsPath = path.join(__dirname, '../events');
        
        if (!fs.existsSync(eventsPath)) {
            this.logger.warn('Events directory not found, creating...');
            fs.mkdirSync(eventsPath, { recursive: true });
            return;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event: Event = require(filePath).default;
            
            if ('name' in event && 'execute' in event) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
                this.logger.info(`✅ Evento cargado: ${event.name}`);
            } else {
                this.logger.warn(`⚠️ Evento inválido en ${filePath}`);
            }
        }
    }
}
