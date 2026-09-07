const { DataTypes } = require("sequelize");

const tableSchema = {
    leads: {
        name: "leads",
        schema: {
            lead_id: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            mobile: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        options: {
            freezeTableName: true,
            timestamps: false,
            underscored: true,
        },
    },
};

module.exports = tableSchema;
