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
    logger.info(`🌙 Mizuki está lista! Conectada como ${readyClient.user.tag}`);
    logger.info(`🌙 Servidores: ${readyClient.guilds.cache.size}`);
    logger.info(`🌙 Usuarios: ${readyClient.users.cache.size}`);
});

// Error handling
client.on(Events.Error, (error) => {
    logger.error('Error del cliente:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
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
