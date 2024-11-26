const {Events} = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (message.content.startsWith('/')) return;
        if (!message.guild) return;

        const member = message.member;
        //TODO
    }
}