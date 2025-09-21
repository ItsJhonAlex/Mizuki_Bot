# 🌙 Mizuki Bot

[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://github.com/ItsJhonAlex/mizuki-bot)
[![Stars](https://img.shields.io/github/stars/ItsJhonAlex/mizuki-bot?style=for-the-badge&logo=github)](https://github.com/ItsJhonAlex/mizuki-bot/stargazers)

Mizuki es tu asistente lunar perfecta para Discord. Con su elegancia celestial y tecnología avanzada, te ayuda a gestionar tu servidor con la suavidad de la luz de luna.

## ✨ Características

- **Moderación automática** - Protege tu servidor con inteligencia
- **Panel web** - Configura todo desde una interfaz web elegante
- **Mini-juegos** - Entretenimiento para tu comunidad
- **Sistema de música** - Reproduce música de alta calidad
- **Roles automáticos** - Gestión inteligente de permisos
- **Logs detallados** - Mantén un registro de todo lo que sucede

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Bot de Discord configurado

### Configuración

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd mizuki-bot
```

2. **Instala dependencias**
```bash
pnpm install
```

3. **Configura variables de entorno**
```bash
cp config.example.env .env
# Edita .env con tus tokens
```

4. **Compila el proyecto**
```bash
pnpm run build
```

5. **Inicia el bot**
```bash
pnpm start
```

## 🛠️ Desarrollo

### Scripts disponibles

- `pnpm dev` - Modo desarrollo con hot reload
- `pnpm build` - Compilar TypeScript
- `pnpm start` - Iniciar bot en producción
- `pnpm clean` - Limpiar archivos compilados

### Estructura del proyecto

```
src/
├── commands/       # Comandos del bot
├── events/         # Eventos de Discord
├── handlers/       # Manejadores
├── utils/          # Utilidades
└── types/          # Tipos TypeScript
```

## 📝 Variables de Entorno

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
BOT_PREFIX=!
BOT_OWNER_ID=your_user_id_here
LOG_LEVEL=info
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🌙 Sobre Mizuki

Mizuki representa la elegancia y eficiencia en la gestión de servidores Discord. Su nombre significa "luna hermosa" en japonés, reflejando su naturaleza celestial y su capacidad para iluminar y organizar tu comunidad.

---

**Desarrollado con ❤️ por ItsJhonAlex**
