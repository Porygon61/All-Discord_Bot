const { Events } = require('discord.js');
const { Users } = require('../models');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        try {
            const [userRecord, created] = await Users.findOrCreate({
                where: { discordId: member.user.id, guildId: member.guild.id },
                defaults: {
                    isBot: member.user.bot,
                    nicknames: member.nickname ? [member.nickname] : [], // Initialize as an array
                    username: member.user.username,
                    tag: member.user.tag,
                    joinedAt: member.joinedAt,
                    roles: member.roles.cache.map((role) => role.id),
                },
            });

            if (!created && member.nickname) {
                const currentNicknames = userRecord.nicknames || [];
                if (!currentNicknames.includes(member.nickname)) {
                    currentNicknames.push(member.nickname);
                    await userRecord.update({ nicknames: currentNicknames });
                    console.log(
                        `Appended nickname for ${member.user.tag}: ${member.nickname}`
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to add member ${member.user.tag}:`, error);
        }
    },
};
