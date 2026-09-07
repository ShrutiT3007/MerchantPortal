const { DataTypes } = require("sequelize");

const tableSchema = {
    user: {
        name: "user",
        schema: {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            userName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    len: 10,
                },
            },
            hashedPassword: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isEmailVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        options: {
            freezeTableName: true,
        },
    },
    casbinRole: {
        name: "casbin_rule",
        schema: {
            ptype: { type: DataTypes.STRING, allowNull: true },
            v0: { type: DataTypes.STRING, allowNull: true },
            v1: { type: DataTypes.STRING, allowNull: true },
            v2: { type: DataTypes.STRING, allowNull: true },
            v3: { type: DataTypes.STRING, allowNull: true },
            v4: { type: DataTypes.STRING, allowNull: true },
            v5: { type: DataTypes.STRING, allowNull: true },
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
    sqs: {
        name: "sqs",
        schema: {
            id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            url: { type: DataTypes.STRING, allowNull: false },
            chatUrl: { type: DataTypes.STRING, allowNull: false },
            cronTime: { type: DataTypes.STRING, allowNull: true },
            threshold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
            name: { type: DataTypes.STRING, allowNull: false },
            isActive :{ type:DataTypes.BOOLEAN , allowNull:false , defaultValue:true},
            alertDelay: {type:DataTypes.INTEGER , allowNull:false , defaultValue:30}
        },
        options: {
            freezeTableName: true,
        },
    },
    locks: {
        name: "locks",
        schema: {
            id: { type: DataTypes.BIGINT, primaryKey: true },
            createdAt: { type: DataTypes.TIME, allowNull: false },
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
    downloadHistory: {
        name: "download_history",
        schema: {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            s3Key: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            fileName: {
                type: DataTypes.STRING(200),
                allowNull: true,
                defaultValue: "untitled",
            },
        },
        options: {
            freezeTableName: true,
        },
    },
    deployedBranches: {
        name: "deployed_branches",
        schema: {
            id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
            ip: { type: DataTypes.STRING, allowNull: false, unique: true },
            branchName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            status: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
            personName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        },
        options: {
            freezeTableName: true,
        },
    },
    promotedBranches: {
        name: "promoted_branches",
        schema: {
            jenkinsId: {
                type: DataTypes.INTEGER,
                primaryKey: true, // part of composite PK
            },
            serviceName: {
                type: DataTypes.STRING(50),
                primaryKey: true,
            },
            branchName: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
        },
        options: {
            freezeTableName: true,
            id: false,
        },
    },
    services: {
        name: "services",
        schema: {
            serviceName: {
                type: DataTypes.STRING(50),
            },
            serverName:{
                type: DataTypes.STRING,
            },
            ip:{
                type:DataTypes.STRING,
                // unique:true,
            },
            chatUrl:{
                type:DataTypes.STRING,
            }
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
    jenkinsMapping: {
        name: "jenkins_mapping",
        schema: {
            promoteJenkins: {
                type: DataTypes.INTEGER,
                primaryKey: true, // part of composite PK
            },
            deployJenkins: {
                type: DataTypes.INTEGER,
                primaryKey: true, // part of composite PK
            },
        },
        options: {
            freezeTableName: true,
            id: false,
            timestamps: false,
        },
    },
    userRoles: {
        name: "user_roles",
        schema: {
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            roleName: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        options: {
            freezeTableName: true,
            id: false,
            timestamps: false,
        },
    },
    subscribers: {
        name: "subscribers",
        schema: {
            serviceName: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            emailId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },
        options: {
            freezeTableName: true,
            id: false,
            timestamps: false,
        },
    },
    qaFlows: {
        name: "qa_flows",
        schema: {
            id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
},
            flowName: {
                type: DataTypes.STRING,
                allowNull: false,
                uniqueValues: true,
            },
            flow: {
                type: DataTypes.JSON,
                AllowNull: true,
                default : {}
            },
            data: {
                type: DataTypes.JSON,
                AllowNull: true,
                default : {},
            },
        },
        options: {
            freezeTableName: true,
        },
    },
    testcases: {
        name: "testcases",
        schema: {
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            method: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            body: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            headers: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            params: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            expectedOutput: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            dbQueries: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            delay: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        options: {
            freezeTableName: true,
            id: false,
            timestamps: false,
        },
    },
    commonStorage: {
        name: "common_storage",
        schema: {
            flowId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            data: {
                type: DataTypes.JSON,
                allowNull: false,
            },
        },
        options: {
            freezeTableName: true,
            id: false,
            timestamps: false,
        },
    },
    dbConfig: {
        name: "db_config",
        schema: {
            name: {
                type: DataTypes.STRING,
            },
            data: {
                type: DataTypes.JSON,
                allowNull: false,
            },
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
    queries: {
        name: "queries",
        schema: {
            dbId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "db_config",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            query: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            queryType:{
                type:DataTypes.STRING,
                allowNull:false,
            }
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
    cachedFunctions: {
        name: "cached_functions",
        schema: {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique :true
            },
            functionString:{
                type:DataTypes.TEXT,
                allowNull:false,
            }
        },
        options: {
            freezeTableName: true,
            timestamps: false,
        },
    },
};

module.exports = tableSchema;
