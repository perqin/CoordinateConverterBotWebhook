'use strict';

const Telegraf = require('telegraf');
const config = require('./config');
const coordTransform = require('coordtransform');
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

bot.on('text', (ctx) => msgRouter(ctx));

function msgRouter(ctx) {
    if (ctx.updateType === 'message') {
        if (ctx.updateSubType === 'text') {
            handleUrl(ctx, ctx.message.text);
        } else {
            ctx.reply('Unsupported message type.');
        }
    } else {
        ctx.reply('Unsupported message type.');
    }
}

function handleUrl(ctx, url) {
    let uo = require('url').parse(url, true);
    // http://maps.google.com/maps?q=22.766619,114.318351
    if (uo.host === 'maps.google.com' && uo.pathname === '/maps' && Object.prototype.hasOwnProperty.call(uo.query, 'q')) {
        let lat = +uo.query['q'].split(',')[0];
        let long = +uo.query['q'].split(',')[1];
        // For Google map
        let gcj = [long, lat];
        // For AMap
        let wgs = coordTransform.wgs84togcj02(gcj[0], gcj[1]);
        let resMd = `**Coordinate (Latitude, Longitude)**\n`
            + `WGS84: (${wgs[1]}, ${wgs[0]}) [Google Map](http://maps.google.com/maps?q=${wgs[1]},${wgs[0]})\n`
            + `GCJ02: (${lat}, ${long}) [AMap (Unavailable yet)](http://amap.com)\n`;
        ctx.replyWithMarkdown(resMd);
    }
}