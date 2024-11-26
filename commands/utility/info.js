const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information about something.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('user')
				.setDescription('Information about a User.')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('The user you want information about.')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('server')
				.setDescription('Information about the server.')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('bot').setDescription('Information about the bot.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('invite')
				.setDescription('Invite the bot to your server.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('role')
				.setDescription('Information about a Role.')
				.addRoleOption((option) =>
					option
						.setName('role')
						.setDescription('The role you want information about.')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'user') {
			const user = interaction.options.getUser('user');
			const member =
				interaction.guild.members.cache.get(user.id) ||
				(await interaction.guild.members.fetch(user.id));
			await interaction.reply(
				`Username: ${user.username}\nID: ${user.id}\nRoles: ${member.roles.cache
					.map((role) => role.name)
					.join(', ')}\nJoined at: ${member.joinedAt}\nCreated at: ${
					user.createdAt
				}`
			);
		} else if (interaction.options.getSubcommand() === 'server') {
			const ownerId = interaction.guild.ownerId;
			await interaction.reply(
				`Server name: ${interaction.guild.name}\nServer ID: ${
					interaction.guild.id
				}\nServer Owner: ${
					interaction.guild.members.cache.get(ownerId).nickname
				} (${
					interaction.guild.members.cache.get(ownerId).user.tag
				})\nMembers: ${interaction.guild.memberCount}`
			);
		} else if (interaction.options.getSubcommand() === 'bot') {
			await interaction.reply(
				`Bot name: ${interaction.client.user.username}\nBot ID: ${interaction.client.user.id}`
			);
		} else if (interaction.options.getSubcommand() === 'invite') {
			await interaction.reply({
				content: `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot`,
			});
		} else if (interaction.options.getSubcommand() === 'role') {
			const role = interaction.options.getRole('role');
			await interaction.reply(
				`Role name: ${role.name}\nRole ID: ${role.id}\nMembers: ${
					role.members.size
				}\n->\n${role.members
					.map((member) => member.nickname + ' (' + member.user.tag + ')')
					.join('\n')}`
			);
		}
	},
};
