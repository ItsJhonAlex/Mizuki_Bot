import { Events, Client } from 'discord.js';
import { Event } from '../types';
import { Logger } from '../utils/Logger';
import { ChangelogManager } from '../utils/ChangelogManager';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        const logger = new Logger();
        const changelogManager = new ChangelogManager(client);

        // Send changelog on bot startup (only if there are commits)
        try {
            await changelogManager.sendLastCommitChangelog();
            logger.info('✅ Changelog inicial enviado');
        } catch (error) {
            logger.warn('⚠️ No se pudo enviar el changelog inicial:', error);
        }
    }
} as Event;
