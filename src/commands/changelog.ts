import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { ChangelogManager } from '../utils/ChangelogManager';
import { Logger } from '../utils/Logger';

const logger = new Logger();

export default {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Envía el changelog del bot al canal correspondiente.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de changelog a enviar')
                .setRequired(true)
                .addChoices(
                    { name: 'Último Commit', value: 'last' },
                    { name: 'Historial (5 commits)', value: 'history' },
                    { name: 'Semanal (10 commits)', value: 'weekly' },
                    { name: 'Release (20 commits)', value: 'release' }
                )
        ),
    cooldown: 10,
    async execute(interaction: ChatInputCommandInteraction) {
        const changelogType = interaction.options.getString('tipo', true);
        const changelogManager = new ChangelogManager(interaction.client);

        try {
            await interaction.deferReply({ ephemeral: true });

            switch (changelogType) {
                case 'last':
                    await changelogManager.sendLastCommitChangelog();
                    await interaction.editReply({ content: '✅ Changelog del último commit enviado exitosamente.' });
                    break;
                case 'history':
                    await changelogManager.sendCommitHistoryChangelog(5);
                    await interaction.editReply({ content: '✅ Changelog con historial de 5 commits enviado exitosamente.' });
                    break;
                case 'weekly':
                    await changelogManager.sendWeeklyChangelog();
                    await interaction.editReply({ content: '✅ Changelog semanal enviado exitosamente.' });
                    break;
                case 'release':
                    await changelogManager.sendReleaseChangelog();
                    await interaction.editReply({ content: '✅ Changelog de release enviado exitosamente.' });
                    break;
                default:
                    await interaction.editReply({ content: '❌ Tipo de changelog no reconocido.' });
                    return;
            }

            logger.commandExecuted(
                'changelog',
                interaction.user.tag,
                interaction.guild?.name
            );
        } catch (error) {
            logger.error('❌ Error al enviar changelog:', error);
            await interaction.editReply({ content: '❌ Hubo un error al enviar el changelog.' });
        }
    },
} as Command;
