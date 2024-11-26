const { Events } = require('discord.js');
const { Users } = require('../models');

module.exports = {
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) {
		// Handle nickname changes
		if (oldMember.nickname !== newMember.nickname) {
			try {
				const userRecord = await Users.findOne({
					where: { discordId: newMember.id, guildId: newMember.guild.id },
				});

				if (userRecord) {
					const currentNicknames = userRecord.nicknames || [];
					if (
						newMember.nickname &&
						!currentNicknames.includes(newMember.nickname)
					) {
						currentNicknames.push(newMember.nickname);
						await userRecord.update({ nicknames: currentNicknames });
						console.log(
							`Appended nickname for ${newMember.user.tag}: ${newMember.nickname}`
						);
					}
				} else {
					console.error(
						`User not found in the database: ${newMember.user.tag}`
					);
				}
			} catch (error) {
				console.error(
					`Failed to update nicknames for ${newMember.user.tag}:`,
					error
				);
			}
		}

		// Handle role changes
		const oldRoles = oldMember.roles.cache.map((role) => role.id),
			newRoles = newMember.roles.cache.map((role) => role.id);

		const removedRoles = oldRoles.filter((role) => !newRoles.includes(role)),
			addedRoles = newRoles.filter((role) => !oldRoles.includes(role));

		if (removedRoles.length > 0 || addedRoles.length > 0) {
			try {
				const userRecord = await Users.findOne({
					where: { discordId: newMember.id, guildId: newMember.guild.id },
				});

				if (userRecord) {
					let currentRoles = userRecord.roles || [];
					if (removedRoles.length > 0) {
						currentRoles = currentRoles.filter(
							(role) => !removedRoles.includes(role)
						);
					}
					if (addedRoles.length > 0) {
						currentRoles.push(...addedRoles);
					}

					await userRecord.update({ roles: [...new Set(currentRoles)] });

					if (removedRoles.length > 0) {
						console.log(
							`Removed roles for ${newMember.user.tag}: ${removedRoles}`
						);
					}
					if (addedRoles.length > 0) {
						console.log(`Added roles for ${newMember.user.tag}: ${addedRoles}`);
					}
				} else {
					console.error(
						`User not found in the database: ${newMember.user.tag}`
					);
				}
			} catch (error) {
				console.error(
					`Failed to update roles for ${newMember.user.tag}:`,
					error
				);
			}
		}
	},
};
