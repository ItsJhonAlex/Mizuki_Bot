import { Events, Client } from 'discord.js';
import { Event } from '../types';
import { BotStatusManager } from '../utils/BotStatus';
import { Logger } from '../utils/Logger';

export default {
    name: Events.ClientReady,
    once: false,
    async execute(client: Client) {
        const logger = new Logger();
        const statusManager = new BotStatusManager(client);
        
        // Update status every 5 minutes
        setInterval(async () => {
            try {
                await statusManager.setOnline();
                logger.debug('🔄 Status refreshed automatically');
            } catch (error) {
                logger.error('❌ Error refreshing status:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        logger.info('✅ Status auto-refresh enabled (every 5 minutes)');
    }
} as Event;
