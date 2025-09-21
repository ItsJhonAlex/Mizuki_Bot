import { EmbedBuilder, TextChannel, Client } from 'discord.js';
import { Logger } from './Logger';

export enum BotStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    MAINTENANCE = 'maintenance',
    RESTARTING = 'restarting',
    ERROR = 'error'
}

export class BotStatusManager {
    private client: Client;
    private logger: Logger;
    private statusChannelId: string;
    private statusMessageId: string | null = null;

    constructor(client: Client) {
        this.client = client;
        this.logger = new Logger();
        this.statusChannelId = process.env.bot_status_id || '';
    }

    async updateStatus(status: BotStatus, customMessage?: string) {
        if (!this.statusChannelId) {
            this.logger.warn('⚠️ Status channel ID not configured');
            return;
        }

        try {
            const statusChannel = await this.client.channels.fetch(this.statusChannelId) as TextChannel;
            if (!statusChannel) {
                this.logger.error('❌ Status channel not found');
                return;
            }

            const embed = this.createStatusEmbed(status, customMessage);
            await this.sendOrUpdateStatus(statusChannel, embed);
            
            this.logger.info(`✅ Status updated to: ${status}`);
        } catch (error) {
            this.logger.error('❌ Error updating status:', error);
        }
    }

    private createStatusEmbed(status: BotStatus, customMessage?: string): EmbedBuilder {
        const statusConfig = this.getStatusConfig(status);
        
        const embed = new EmbedBuilder()
            .setTitle('🌙 Mizuki Bot Status')
            .setColor(statusConfig.color)
            .setThumbnail(this.client.user?.displayAvatarURL() || '')
            .addFields(
                {
                    name: '🔄 Status',
                    value: `**${statusConfig.name}**`,
                    inline: true
                },
                {
                    name: '⏰ Uptime',
                    value: this.formatUptime(process.uptime()),
                    inline: true
                },
                {
                    name: '📊 Servidores',
                    value: `**${this.client.guilds.cache.size}** servidores`,
                    inline: true
                },
                {
                    name: '👥 Usuarios',
                    value: `**${this.client.users.cache.size}** usuarios`,
                    inline: true
                },
                {
                    name: '💾 Memoria',
                    value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                    inline: true
                },
                {
                    name: '🔧 Comandos',
                    value: `**${this.client.commands?.size || 0}** comandos`,
                    inline: true
                }
            )
            .setFooter({
                text: `Mizuki Bot • ${new Date().toLocaleString('es-ES')}`,
                ...(this.client.user?.displayAvatarURL() && { iconURL: this.client.user.displayAvatarURL() })
            })
            .setTimestamp();

        if (customMessage) {
            embed.addFields({
                name: '📝 Mensaje',
                value: customMessage,
                inline: false
            });
        }

        return embed;
    }

    private getStatusConfig(status: BotStatus) {
        switch (status) {
            case BotStatus.ONLINE:
                return { name: '🟢 Online', color: 0x00ff00 };
            case BotStatus.OFFLINE:
                return { name: '🔴 Offline', color: 0xff0000 };
            case BotStatus.MAINTENANCE:
                return { name: '🟡 Mantenimiento', color: 0xffff00 };
            case BotStatus.RESTARTING:
                return { name: '🔄 Reiniciando', color: 0x0099ff };
            case BotStatus.ERROR:
                return { name: '❌ Error', color: 0xff0000 };
            default:
                return { name: '❓ Desconocido', color: 0x808080 };
        }
    }

    private formatUptime(seconds: number): string {
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

    private async sendOrUpdateStatus(channel: TextChannel, embed: EmbedBuilder) {
        try {
            // Try to find existing status message
            const messages = await channel.messages.fetch({ limit: 20 });
            const statusMessage = messages.find(msg => 
                msg.author.id === this.client.user?.id && 
                msg.embeds[0]?.title?.includes('Mizuki Bot Status')
            );

            if (statusMessage) {
                // Update existing message
                await statusMessage.edit({ embeds: [embed] });
                this.statusMessageId = statusMessage.id;
                this.logger.info('📝 Status message updated');
            } else {
                // Send new message
                const message = await channel.send({ embeds: [embed] });
                this.statusMessageId = message.id;
                this.logger.info('📤 New status message sent');
            }
        } catch (error) {
            this.logger.error('❌ Error updating status message:', error);
        }
    }

    // Public methods for different status updates
    async setOnline() {
        await this.updateStatus(BotStatus.ONLINE);
    }

    async setOffline() {
        await this.updateStatus(BotStatus.OFFLINE);
    }

    async setMaintenance(message: string) {
        await this.updateStatus(BotStatus.MAINTENANCE, message);
    }

    async setRestarting() {
        await this.updateStatus(BotStatus.RESTARTING, 'El bot se está reiniciando...');
    }

    async setError(message: string) {
        await this.updateStatus(BotStatus.ERROR, message);
    }
}
