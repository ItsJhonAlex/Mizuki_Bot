import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { BotStatusManager, BotStatus } from '../utils/BotStatus';
import { Logger } from '../utils/Logger';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Cambia el estado del bot')
        .addStringOption(option =>
            option
                .setName('estado')
                .setDescription('Estado a establecer')
                .setRequired(true)
                .addChoices(
                    { name: '🟢 Online', value: 'online' },
                    { name: '🔴 Offline', value: 'offline' },
                    { name: '🟡 Mantenimiento', value: 'maintenance' },
                    { name: '🔄 Reiniciando', value: 'restarting' },
                    { name: '❌ Error', value: 'error' }
                )
        )
        .addStringOption(option =>
            option
                .setName('mensaje')
                .setDescription('Mensaje personalizado (opcional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const logger = new Logger();
        const statusManager = new BotStatusManager(interaction.client);
        
        const estado = interaction.options.getString('estado', true) as BotStatus;
        const mensaje = interaction.options.getString('mensaje');
        
        try {
            await interaction.deferReply({ ephemeral: true });
            
            switch (estado) {
                case 'online':
                    await statusManager.setOnline();
                    break;
                case 'offline':
                    await statusManager.setOffline();
                    break;
                case 'maintenance':
                    await statusManager.setMaintenance(mensaje || 'El bot está en mantenimiento');
                    break;
                case 'restarting':
                    await statusManager.setRestarting();
                    break;
                case 'error':
                    await statusManager.setError(mensaje || 'El bot ha encontrado un error');
                    break;
            }
            
            await interaction.editReply({
                content: `✅ Estado cambiado a: **${estado}**${mensaje ? `\n📝 Mensaje: ${mensaje}` : ''}`
            });
            
            logger.commandExecuted('status', interaction.user.tag, interaction.guild?.name);
            
        } catch (error) {
            logger.error('Error ejecutando comando status:', error);
            await interaction.editReply({
                content: '❌ Hubo un error cambiando el estado del bot'
            });
        }
    },
    
    cooldown: 10
} as Command;
