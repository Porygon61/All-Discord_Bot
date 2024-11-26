const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trigger')
		.setDescription('Triggers an event.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('guild-create')
				.setDescription('Triggers the guildCreate event.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('guild-member-add')
				.setDescription('Triggers the guildMemberAdd event.')
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'guild-create') {
			await interaction.client.emit('guildCreate', interaction.guild);
			interaction.reply('emitted guildCreate!');
		} else if (interaction.options.getSubcommand() === 'guild-member-add') {
			await interaction.client.emit('guildMemberAdd', interaction.member);
			interaction.reply('emitted guildMemberAdd!');
		}
	},
};
