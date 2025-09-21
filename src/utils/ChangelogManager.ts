import { EmbedBuilder, TextChannel, Client } from 'discord.js';
import { Logger } from './Logger';
import { GitInfo, GitCommit } from './GitInfo';

export class ChangelogManager {
    private client: Client;
    private logger: Logger;
    private gitInfo: GitInfo;
    private changelogChannelId: string;

    constructor(client: Client) {
        this.client = client;
        this.logger = new Logger();
        this.gitInfo = new GitInfo();
        this.changelogChannelId = process.env.chanelog_id || '';
    }

    async sendLastCommitChangelog() {
        if (!this.changelogChannelId) {
            this.logger.warn('⚠️ Changelog channel ID not configured');
            return;
        }

        try {
            const changelogChannel = await this.client.channels.fetch(this.changelogChannelId) as TextChannel;
            if (!changelogChannel) {
                this.logger.error('❌ Changelog channel not found');
                return;
            }

            const lastCommit = this.gitInfo.getLastCommit();
            if (!lastCommit) {
                this.logger.warn('⚠️ No git information available');
                return;
            }

            const embed = this.createChangelogEmbed(lastCommit);
            await changelogChannel.send({ embeds: [embed] });
            
            this.logger.info('✅ Changelog sent successfully');
        } catch (error) {
            this.logger.error('❌ Error sending changelog:', error);
        }
    }

    async sendCommitHistoryChangelog(limit: number = 5) {
        if (!this.changelogChannelId) {
            this.logger.warn('⚠️ Changelog channel ID not configured');
            return;
        }

        try {
            const changelogChannel = await this.client.channels.fetch(this.changelogChannelId) as TextChannel;
            if (!changelogChannel) {
                this.logger.error('❌ Changelog channel not found');
                return;
            }

            const commits = this.gitInfo.getCommitHistory(limit);
            if (commits.length === 0) {
                this.logger.warn('⚠️ No commit history available');
                return;
            }

            const embed = this.createHistoryChangelogEmbed(commits);
            await changelogChannel.send({ embeds: [embed] });
            
            this.logger.info(`✅ Changelog with ${commits.length} commits sent successfully`);
        } catch (error) {
            this.logger.error('❌ Error sending changelog history:', error);
        }
    }

    private createChangelogEmbed(commit: GitCommit): EmbedBuilder {
        const repoInfo = this.gitInfo.getRepositoryInfo();
        const formattedMessage = this.gitInfo.formatCommitMessage(commit.message);
        
        const embed = new EmbedBuilder()
            .setTitle('📝 Changelog - Último Commit')
            .setColor(0x5865f2) // Discord blue
            .setThumbnail(this.client.user?.displayAvatarURL() || '')
            .addFields(
                {
                    name: '🔖 Commit',
                    value: `\`${commit.shortHash}\``,
                    inline: true
                },
                {
                    name: '👤 Autor',
                    value: commit.author,
                    inline: true
                },
                {
                    name: '📅 Fecha',
                    value: `<t:${Math.floor(new Date(commit.date).getTime() / 1000)}:F>`,
                    inline: true
                },
                {
                    name: '🌿 Rama',
                    value: `\`${commit.branch}\``,
                    inline: true
                },
                {
                    name: '📝 Mensaje',
                    value: formattedMessage,
                    inline: false
                }
            )
            .setFooter({
                text: `Mizuki Bot • Changelog`,
                ...(this.client.user?.displayAvatarURL() && { iconURL: this.client.user.displayAvatarURL() })
            })
            .setTimestamp();

        if (repoInfo.remoteUrl) {
            embed.addFields({
                name: '🔗 Repositorio',
                value: `[Ver en GitHub](${repoInfo.remoteUrl.replace('.git', '')}/commit/${commit.hash})`,
                inline: false
            });
        }

        return embed;
    }

    private createHistoryChangelogEmbed(commits: GitCommit[]): EmbedBuilder {
        const repoInfo = this.gitInfo.getRepositoryInfo();
        
        const embed = new EmbedBuilder()
            .setTitle('📝 Changelog - Historial de Commits')
            .setColor(0x5865f2) // Discord blue
            .setThumbnail(this.client.user?.displayAvatarURL() || '')
            .setDescription(`Últimos **${commits.length}** commits:`)
            .setFooter({
                text: `Mizuki Bot • Changelog`,
                ...(this.client.user?.displayAvatarURL() && { iconURL: this.client.user.displayAvatarURL() })
            })
            .setTimestamp();

        // Add commits to embed (Discord has a limit of 25 fields)
        const maxCommits = Math.min(commits.length, 20);
        for (let i = 0; i < maxCommits; i++) {
            const commit = commits[i];
            if (!commit) continue; // Skip if commit is undefined
            
            const formattedMessage = this.gitInfo.formatCommitMessage(commit.message);
            
            embed.addFields({
                name: `\`${commit.shortHash}\` ${formattedMessage}`,
                value: `👤 ${commit.author} • <t:${Math.floor(new Date(commit.date).getTime() / 1000)}:R>`,
                inline: false
            });
        }

        if (repoInfo.remoteUrl) {
            embed.addFields({
                name: '🔗 Repositorio',
                value: `[Ver en GitHub](${repoInfo.remoteUrl.replace('.git', '')})`,
                inline: false
            });
        }

        return embed;
    }

    // Public methods for different changelog types
    async sendNewCommitChangelog() {
        await this.sendLastCommitChangelog();
    }

    async sendWeeklyChangelog() {
        await this.sendCommitHistoryChangelog(10);
    }

    async sendReleaseChangelog() {
        await this.sendCommitHistoryChangelog(20);
    }
}
