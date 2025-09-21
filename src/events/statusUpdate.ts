import { Events, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Event } from '../types';
import { Logger } from '../utils/Logger';

// Helper functions outside the event object
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

async function updateStatusMessage(channel: TextChannel, embed: EmbedBuilder, logger: Logger) {
    try {
        // Try to find existing status message
        const messages = await channel.messages.fetch({ limit: 10 });
        const statusMessage = messages.find(msg => 
            msg.author.id === channel.client.user?.id && 
            msg.embeds[0]?.title?.includes('Mizuki Bot Status')
        );

        if (statusMessage) {
            // Update existing message
            await statusMessage.edit({ embeds: [embed] });
            logger.info('📝 Status message updated');
        } else {
            // Send new message
            await channel.send({ embeds: [embed] });
            logger.info('📤 New status message sent');
        }
    } catch (error) {
        logger.error('❌ Error updating status message:', error);
    }
}

export default {
    name: Events.ClientReady,
    once: false,
    async execute(client: Client) {
        const logger = new Logger();
        
        // Get status channel ID from environment
        const statusChannelId = process.env.bot_status_id;
        if (!statusChannelId) {
            logger.warn('⚠️ Status channel ID not configured in .env');
            return;
        }

        try {
            const statusChannel = await client.channels.fetch(statusChannelId) as TextChannel;
            if (!statusChannel) {
                logger.error('❌ Status channel not found');
                return;
            }

            // Create status embed
            const statusEmbed = new EmbedBuilder()
                .setTitle('🌙 Mizuki Bot Status')
                .setColor(0x00ff00) // Green for online
                .setThumbnail(client.user?.displayAvatarURL() || '')
                .addFields(
                    {
                        name: '🟢 Status',
                        value: '**Online**',
                        inline: true
                    },
                    {
                        name: '⏰ Uptime',
                        value: formatUptime(process.uptime()),
                        inline: true
                    },
                    {
                        name: '📊 Servidores',
                        value: `**${client.guilds.cache.size}** servidores`,
                        inline: true
                    },
                    {
                        name: '👥 Usuarios',
                        value: `**${client.users.cache.size}** usuarios`,
                        inline: true
                    },
                    {
                        name: '💾 Memoria',
                        value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                        inline: true
                    },
                    {
                        name: '🔧 Comandos',
                        value: `**${client.commands?.size || 0}** comandos`,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Mizuki Bot • ${new Date().toLocaleString('es-ES')}`,
                    ...(client.user?.displayAvatarURL() && { iconURL: client.user.displayAvatarURL() })
                })
                .setTimestamp();

            // Send or update status message
            await updateStatusMessage(statusChannel, statusEmbed, logger);
            
            logger.info('✅ Status embed updated successfully');
            
        } catch (error) {
            logger.error('❌ Error updating status:', error);
        }
    }
} as Event;
