module.exports = (sequelize, DataTypes) => {
	return sequelize.define(
		'Guilds',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			ownerId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			roles: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			memberAmount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{
			createdAt: false,
		}
	);
};
