'use strict';

const url = require('url');
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
            handleMessageText(ctx);
        } else {
            ctx.reply('Unsupported message type.');
        }
    } else {
        ctx.reply('Unsupported message type.');
    }
}

function handleMessageText(ctx) {
    let urlObjects = [];
    // Find URL from entities
    if (ctx.message.entities) {
        urlObjects = ctx.message.entities.filter(function (value) {
            return (value.type === 'text_link' || value.type === 'url');
        }).map(function (value) {
            if (value.type === 'text_link') {
                return url.parse(value.url, true);
            } else {
                return url.parse(ctx.message.text.substr(value.offset, value.length), true);
            }
        }).filter(function (value) {
            return value.host === 'maps.google.com' && value.pathname === '/maps'
                && Object.prototype.hasOwnProperty.call(value.query, 'q');
        });
    } else {
        urlObjects = [url.parse(ctx.message.text)];
    }
    if (urlObjects.length > 0) {
        urlObjects.forEach(function (value) {
            let lat = +value.query['q'].split(',')[0];
            let long = +value.query['q'].split(',')[1];
            // From bot, which is real coordinate
            // let wgs = [long, lat];
            // For Google map, which is encrypted
            let gcj = coordTransform.wgs84togcj02(long, lat);
            let resMd = `(${lat}, ${long}): [View in Google Map](http://maps.google.com/maps?q=${gcj[1]},${gcj[0]})\n`;
            ctx.replyWithMarkdown(resMd);
        });
    } else {
        ctx.reply('No Google Map url found.');
    }
    // http://maps.google.com/maps?q=22.123456,114.123456
    /*
    My phone gets GPS coordinate which is in GCJ.
    My Google Map uses map in GCJ.
    So I can use it for navigation.
    Ingress's map use WGS.
    So it has error.
    Bot also uses WGS.
    So it also has error.
    I must convert WGS from bot into GCJ for Google Map.
     */
}