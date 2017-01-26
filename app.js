'use strict';

const Telegraf = require('telegraf');
const config = require('./config');

const bot = new Telegraf(process.env.BOT_TOKEN || config.hook.token);

// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(config.hook.url);

// Start https webhook
// FYI: First non-file reply will be served via webhook response
bot.startWebhook(config.hook.path, null, 3000);

bot.on('text', (ctx) => ctx.reply('Hey there!'));
