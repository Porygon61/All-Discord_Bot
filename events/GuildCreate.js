const { Events } = require('discord.js');
const { Users, Guilds } = require('../models');

module.exports = {
	name: Events.GuildCreate,
	once: true,
	async execute(guild) {
		console.log(`Joined a new guild: "${guild.name}"`);

		try {
			// Fetch all members of the guild
			await guild.members.fetch();

			// Loop through all members and save to the database
			for (const member of guild.members.cache.values()) {
				try {
					const [userRecord, created] = await Users.findOrCreate({
						where: { discordId: member.id, guildId: guild.id },
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
						// Append the nickname if it already exists
						const currentNicknames = userRecord.nicknames || [];
						if (!currentNicknames.includes(member.nickname)) {
							currentNicknames.push(member.nickname);
							await userRecord.update({ nicknames: currentNicknames });
						}
					}
				} catch (error) {
					console.error(
						`Failed to add/update member ${member.user.tag}:`,
						error
					);
				}
			}
		} catch (error) {
			console.error('Error fetching guild members:', error);
		}

		// Save the guild to the database
		await guild.fetchOwner().then((owner) => {
			Guilds.findOrCreate({
				where: { guildId: guild.id },
				defaults: {
					ownerId: owner.id,
					name: guild.name,
					createdAt: guild.createdAt,
					roles: guild.roles.cache.map((role) => role.id),
					memberAmount: guild.memberCount,
					guildId: guild.id,
				},
			});
		});
	},
};
