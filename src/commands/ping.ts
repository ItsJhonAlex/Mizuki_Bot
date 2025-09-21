import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con Pong! y muestra la latencia del bot'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({ 
            content: '🏓 Calculando ping...', 
            fetchReply: true 
        });
        
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketHeartbeat = interaction.client.ws.ping;
        
        await interaction.editReply(
            `🏓 **Pong!**\n` +
            `📡 **Latencia de ida y vuelta:** ${roundtripLatency}ms\n` +
            `💓 **Latencia del WebSocket:** ${websocketHeartbeat}ms\n` +
            `🌙 **Mizuki está funcionando perfectamente!**`
        );
    },
    
    cooldown: 3
} as Command;
