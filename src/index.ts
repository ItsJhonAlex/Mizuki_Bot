import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import { CommandHandler } from './handlers/CommandHandler';
import { EventHandler } from './handlers/EventHandler';
import { Logger } from './utils/Logger';

// Load environment variables
config();

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});

// Initialize handlers
const commandHandler = new CommandHandler();
const eventHandler = new EventHandler();
const logger = new Logger();

// Set up command collection
client.commands = new Collection();

// Bot ready event
client.once(Events.ClientReady, (readyClient) => {
    logger.createHeader('Mizuki Bot Iniciada');
    logger.botReady(
        readyClient.user.tag,
        readyClient.guilds.cache.size,
        readyClient.users.cache.size
    );
    logger.info(`🌙 Comandos cargados: ${client.commands?.size || 0}`);
    logger.createSeparator();
});

// Error handling
client.on(Events.Error, async (error) => {
    logger.error('Error del cliente:', error);
    
    // Update status to error
    const { BotStatusManager } = await import('./utils/BotStatus');
    const statusManager = new BotStatusManager(client);
    await statusManager.setError('Error del cliente detectado');
});

process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Update status to error
    const { BotStatusManager } = await import('./utils/BotStatus');
    const statusManager = new BotStatusManager(client);
    await statusManager.setError('Promesa rechazada no manejada');
});

process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    
    // Update status to error before exit
    const { BotStatusManager } = await import('./utils/BotStatus');
    const statusManager = new BotStatusManager(client);
    await statusManager.setError('Excepción no manejada - Cerrando');
    
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
    logger.info('🔄 Recibida señal SIGINT, actualizando estado...');
    
    const { BotStatusManager } = await import('./utils/BotStatus');
    const statusManager = new BotStatusManager(client);
    await statusManager.setRestarting();
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('🔄 Recibida señal SIGTERM, actualizando estado...');
    
    const { BotStatusManager } = await import('./utils/BotStatus');
    const statusManager = new BotStatusManager(client);
    await statusManager.setOffline();
    
    process.exit(0);
});

// Load commands and events
async function loadBot() {
    try {
        await commandHandler.loadCommands(client);
        await eventHandler.loadEvents(client);
        
        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        logger.error('Error al cargar el bot:', error);
        process.exit(1);
    }
}

// Start the bot
loadBot();
