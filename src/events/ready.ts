import { Events, Client } from 'discord.js';
import { Event } from '../types';
import { Logger } from '../utils/Logger';
import { BotStatusManager, BotStatus } from '../utils/BotStatus';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        const logger = new Logger();
        const statusManager = new BotStatusManager(client);
        
        logger.createHeader('Mizuki Bot Iniciada');
        logger.botReady(
            client.user?.tag || 'Mizuki',
            client.guilds.cache.size,
            client.users.cache.size
        );
        logger.info(`🌙 Comandos cargados: ${client.commands?.size || 0}`);
        
        // Set bot rich presence
        const presenceName = process.env.rich_presence_name || '🌙 Gestionando servidores';
        const presenceType = parseInt(process.env.rich_presence_type || '3');
        client.user?.setActivity(presenceName, { type: presenceType });
        
        // Update status to online
        await statusManager.setOnline();
        
        logger.createSeparator();
        logger.info('🌙 Mizuki está lista para ayudar!');
    }
} as Event;
