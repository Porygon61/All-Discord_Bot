const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	REST,
	Routes,
} = require('discord.js');

const { Users, Guilds } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('db')
		.setDescription('Manipulation of the database.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommandGroup((group) =>
			group
				.setName('set')
				.setDescription('SET data in the database.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('update')
						.setDescription('Update the database.')
						.addStringOption((option) =>
							option
								.setName('table')
								.setDescription('Table name to check/update')
								.setRequired(true)
								.addChoices({ name: 'users', value: 'users' })
						)
				)
		)
		.addSubcommandGroup((group) =>
			group
				.setName('get')
				.setDescription('GET data from the database.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('user')
						.setDescription('Get data about a user.')
						.addStringOption((option) =>
							option
								.setName('user-identifier')
								.setDescription('id / username / tag - of the user')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('guild')
						.setDescription('Get data about a guild.')
						.addStringOption((option) =>
							option
								.setName('guild-identifier')
								.setDescription('id / name - of the guild')
								.setRequired(true)
						)
				)
		),
	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: true });

			const subcommandGroup = interaction.options.getSubcommandGroup();
			const subcommand = interaction.options.getSubcommand();

			if (subcommandGroup === 'set') {
				if (subcommand === 'update') {
					const table = interaction.options.getString('table');
					if (table === 'users') {
						try {
							await interaction.guild.members.fetch();
							const allMembers = interaction.guild.members.cache;

							let addedCount = 0;
							let updatedCount = 0;

							for (const member of allMembers.values()) {
								const [userRecord, created] = await Users.findOrCreate({
									where: {
										discordId: member.user.id,
										guildId: member.guild.id,
									},
									defaults: {
										isBot: member.user.bot,
										nicknames: [member.nickname || null],
										username: member.user.username,
										tag: member.user.tag,
										joinedAt: member.joinedAt,
										roles: member.roles.cache.map((role) => role.id),
									},
								});
								if (created) {
									addedCount++;
								} else {
									const updatedRoles = [
										...new Set([
											...userRecord.roles,
											...member.roles.cache.map((role) => role.id),
										]),
									];
									const updatedNicknames = [
										...new Set([
											...userRecord.nicknames,
											member.nickname || null,
										]),
									];
									await userRecord.update({
										username: member.user.username,
										tag: member.user.tag,
										nicknames: updatedNicknames,
										roles: updatedRoles,
										joinedAt: member.joinedAt || userRecord.joinedAt,
									});
									updatedCount++;
								}
							}
							await interaction.followUp({
								content: `Database updated:\n- Users added: ${addedCount}\n- Users updated: ${updatedCount}`,
								ephemeral: true,
							});
						} catch (error) {
							console.error('Error updating users table', error);
							await interaction.followUp({
								content: `Error updating the database: ${error.message}`,
								ephemeral: true,
							});
						}
					} else {
						await interaction.followUp({
							content: `Invalid table: ${table}`,
							ephemeral: true,
						});
					}
				} else {
					await interaction.followUp({
						content: `Invalid subcommand under 'set': ${subcommand}`,
						ephemeral: true,
					});
				}
			} else if (subcommandGroup === 'get') {
				if (subcommand === 'user') {
					const identifier = interaction.options.getString('user-identifier');
					const user = await Users.findOne({
						where: {
							[Op.or]: [
								{ username: identifier },
								{ tag: identifier },
								{ discordId: identifier },
							],
						},
					});
					if (user) {
						await interaction.followUp({
							content: `User found:\n\`\`\`json\n${JSON.stringify(
								user.toJSON(),
								null,
								2
							)}\n\`\`\``,
							ephemeral: true,
						});
					} else {
						await interaction.followUp({
							content: 'User not found.',
							ephemeral: true,
						});
					}
				} else if (subcommand === 'guild') {
					const identifier = interaction.options.getString('guild-identifier');
					const guild = await Guilds.findOne({
						where: {
							[Op.or]: [{ name: identifier }, { guildId: identifier }],
						},
					});
					if (guild) {
						await interaction.followUp({
							content: `Guild found:\n\`\`\`json\n${JSON.stringify(
								guild.toJSON(),
								null,
								2
							)}\n\`\`\``,
							ephemeral: true,
						});
					} else {
						await interaction.followUp({
							content: 'Guild not found.',
							ephemeral: true,
						});
					}
				} else {
					await interaction.followUp({
						content: `Invalid subcommand under 'get': ${subcommand}`,
						ephemeral: true,
					});
				}
			} else {
				await interaction.followUp({
					content: `Invalid subcommand group: ${subcommandGroup}`,
					ephemeral: true,
				});
			}
		} catch (error) {
			console.error('Command execution error:', error);
			await interaction.followUp({
				content: `Unexpected error: ${error.message}`,
				ephemeral: true,
			});
		}
	},
};
