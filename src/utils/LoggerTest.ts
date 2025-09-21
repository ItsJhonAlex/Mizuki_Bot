import { Logger } from './Logger';

// Test the new logger
export function testLogger() {
    const logger = new Logger();
    
    logger.createHeader('Test del Logger de Mizuki');
    
    // Test basic logging
    logger.info('Probando el logger básico');
    logger.warn('Esta es una advertencia');
    logger.error('Este es un error de prueba');
    logger.debug('Información de debug');
    
    // Test special methods
    logger.botReady('Mizuki#1234', 5, 150);
    logger.commandExecuted('ping', 'Usuario#1234', 'Servidor de Prueba');
    logger.userJoined('NuevoUsuario#5678', 'Servidor de Prueba');
    logger.userLeft('UsuarioSalido#9012', 'Servidor de Prueba');
    logger.messageDeleted('Usuario#3456', '#general', 'Servidor de Prueba');
    
    logger.createSeparator();
    logger.info('Test del logger completado');
    logger.createSeparator();
}
