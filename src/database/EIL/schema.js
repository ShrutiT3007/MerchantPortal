const { DataTypes } = require("sequelize");

const tableSchema = {
    transactions: {
        name: "ei_transaction",
        schema: {
            transaction_ref: {
                type: DataTypes.STRING(250),
                allowNull: false,
                primaryKey: true,
            },
            loan_application_id: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            transaction_amount: {
                type: DataTypes.DECIMAL(16, 2),
                allowNull: false,
            },
            bank_transaction_id: {
                type: DataTypes.STRING(250),
                allowNull: true,
            },
            bank_transaction_ref: {
                type: DataTypes.STRING(250),
                allowNull: true,
            },
            bank_transaction_comments: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            transaction_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            transaction_status: {
                type: DataTypes.STRING(32),
                allowNull: false,
            },
            balance_for_month: {
                type: DataTypes.DECIMAL(16, 2),
                allowNull: false,
            },
            ei_start_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            ei_end_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            metadata: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            amount_settled: {
                type: DataTypes.DECIMAL(16, 2),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        options: {
            freezeTableName: true,
            timestamps: false,
            underscored: true,
        },
    },
    loanApplicationDetails: {
        name: "loan_application_details",
        schema: {
            application_id: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            entity_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            merchant_id: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(16),
                allowNull: false,
            },
            loan_acc_status: {
                type: DataTypes.STRING(16),
                allowNull: true,
            },
            current_acc_status: {
                type: DataTypes.STRING(16),
                allowNull: true,
            },
            journey_id: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            current_account_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            sequence: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: -1.0,
            },
            merchant_status: {
                type: DataTypes.STRING(10),
                allowNull: true,
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
