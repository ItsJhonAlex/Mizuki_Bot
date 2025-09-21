import { Client, Collection, Events, Interaction } from 'discord.js';
import { Command } from '../types';
import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

export class CommandHandler {
    private logger: Logger;
    private cooldowns: Collection<string, Collection<string, number>>;

    constructor() {
        this.logger = new Logger();
        this.cooldowns = new Collection();
    }

    async loadCommands(client: Client): Promise<void> {
        const commandsPath = path.join(__dirname, '../commands');
        
        if (!fs.existsSync(commandsPath)) {
            this.logger.warn('Commands directory not found, creating...');
            fs.mkdirSync(commandsPath, { recursive: true });
            return;
        }

        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const stat = fs.statSync(folderPath);
            
            if (stat.isDirectory()) {
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts'));
                
                for (const file of commandFiles) {
                    const filePath = path.join(folderPath, file);
                    const command: Command = require(filePath).default;
                    
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        this.logger.info(`✅ Comando cargado: ${command.data.name}`);
                    } else {
                        this.logger.warn(`⚠️ Comando inválido en ${filePath}`);
                    }
                }
            }
        }

        // Set up interaction handler
        client.on(Events.InteractionCreate, async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Check cooldown
            if (command.cooldown) {
                const { cooldowns } = client;
                if (!cooldowns.has(command.data.name)) {
                    cooldowns.set(command.data.name, new Collection());
                }

                const now = Date.now();
                const timestamps = cooldowns.get(command.data.name)!;
                const defaultCooldownDuration = 3;
                const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

                if (timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

                    if (now < expirationTime) {
                        const expiredTimestamp = Math.round(expirationTime / 1000);
                        return interaction.reply({
                            content: `⏰ Por favor espera, puedes usar \`${command.data.name}\` <t:${expiredTimestamp}:R>.`,
                            ephemeral: true
                        });
                    }
                }

                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            }

            // Execute command
            try {
                await command.execute(interaction);
                this.logger.info(`🌙 Comando ejecutado: ${command.data.name} por ${interaction.user.tag}`);
            } catch (error) {
                this.logger.error(`Error ejecutando comando ${command.data.name}:`, error);
                
                const errorMessage = {
                    content: '❌ Hubo un error ejecutando este comando!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        });
    }
}
