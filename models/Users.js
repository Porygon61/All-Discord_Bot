module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'Users',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			isBot: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			discordId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			nicknames: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			tag: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			level: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			levelXp: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			joinedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			roles: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			createdAt: false,
		}
	);
};
