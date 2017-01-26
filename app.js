'use strict';

const Telegraf = require('telegraf');
const config = require('./config');
const HttpsProxyAgent = require('https-proxy-agent');

const bot = new Telegraf(process.env.BOT_TOKEN || config.auth.token, {
    telegram: {
        agent: config.proxy.enabled ? new HttpsProxyAgent(config.proxy.url) : null
    }
});

// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(config.hook.url);

// Start https webhook
// FYI: First non-file reply will be served via webhook response
bot.startWebhook(config.hook.path, null, config.hook.listen.port);

bot.on('text', (ctx) => ctx.reply('Hey there!'));
