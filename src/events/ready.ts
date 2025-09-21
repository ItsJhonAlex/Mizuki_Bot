import { Events, Client } from 'discord.js';
import { Event } from '../types';
import { Logger } from '../utils/Logger';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        const logger = new Logger();
        
        logger.info(`🌙 Mizuki está lista! Conectada como ${client.user?.tag}`);
        logger.info(`🌙 Servidores: ${client.guilds.cache.size}`);
        logger.info(`🌙 Usuarios: ${client.users.cache.size}`);
        logger.info(`🌙 Comandos cargados: ${client.commands?.size || 0}`);
        
        // Set bot status
        client.user?.setActivity('🌙 Gestionando servidores', { type: 3 }); // Watching
        
        logger.info('🌙 Mizuki está lista para ayudar!');
    }
} as Event;
