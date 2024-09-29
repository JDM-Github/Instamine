const pg = require('pg');
const { Sequelize, DataTypes } = require('sequelize');


// Sequelize for database, you can use what you want.
// This sequelize is also good. 
class DatabaseHandler {

	constructor(host, username, password, databaseName, port) {
		this.databaseName = databaseName;
		this.username     = username;
		this.password     = password;
		this.sequelize    = new Sequelize({
			dialect: 'postgres',
			dialectModule: pg,
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false
				}
			},
			host    : host,
			port    : port,
			username: username,
			password: password,
			database: databaseName
		});
	}

	async connect() {
		try {
			await this.sequelize.authenticate();
			console.log('Connection to database has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
		}
	}

	async is_connected() {
		try {
			await this.sequelize.authenticate();
			console.log('Database connection established successfully.');
			return "true";
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			return "false";
		}
	}

	defineModel(modelName, attributes, options = {}) {
		if (!attributes.id) {
			attributes.id = {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true
			};
		}
		const Model = this.sequelize.define(modelName, attributes, options);
		return Model;
	}

	async retrieveModel(tableName) {
		try {
			const tableDescription = await this.sequelize.query(
				`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}'`,
				{ type: this.sequelize.QueryTypes.SELECT }
			);

			if (tableDescription.length === 0) {
				console.log(`Table ${tableName} does not exist.`);
				return null;
			}

			const attributes = {}; // Map the attributes to use the attributes based on the retrieve table
			tableDescription.forEach(column => {
				attributes[column.column_name] = { type: Sequelize[column.data_type.toUpperCase()] };
			});
			const Model = this.defineModel(tableName, attributes);
			return Model;
		} catch (error) {
			console.error(`Error retrieving model for table ${tableName}:`, error);
			return null;
		}
	}

	async createTableIfNotExists(tableName, attributes, options = {}) {
		let Model = await this.retrieveModel(tableName);
		if (Model === null)
		{
			console.log(`Table ${tableName} does not exist. Creating table...`);
			Model = this.defineModel(tableName, attributes, options);
		}
		return Model;
	}

	async getTableData(tableName) {
		try {
			const results = await dbHandler.sequelize.query(`SELECT * FROM ${tableName}`, {
				type: dbHandler.sequelize.QueryTypes.SELECT
			});
			return results;
		} catch (error) {
			console.error(`Error retrieving data from table ${tableName}:`, error);
		}
		return results;
	};

	async getDataQuery(query) {
		try {
			const results = await dbHandler.sequelize.query(`${query}`, {
				type: dbHandler.sequelize.QueryTypes.SELECT
			});
			return results;
		} catch (error) {
			console.error(`Invalid Query: ${query}:`, error);
		}
		return results;
	};

	async createRecord(Model, data) {
		try {
			const record = await Model.create(data);
			console.log('Record created:', record.toJSON());
			return record;
		} catch (error) {
			console.error('Error creating record:', error);
			return null;
		}
	}

	async findRecordById(Model, id)
	{
		try {
			const record = await Model.findByPk(id);
			if (record) {
				console.log('Record found:', record.toJSON());
			} else {
				console.log('Record not found.');
			}
			return record;
		} catch (error) {
			console.error('Error finding record by id:', error);
			return null;
		}
	}

	async updateRecord(Model, id, newData) {
		try {
			const record = await Model.findByPk(id);
			if (record) {
				await record.update(newData);
				console.log('Record updated successfully.');
				return true;
			} else {
				console.log('Record not found, update failed.');
				return false;
			}
		} catch (error) {
			console.error('Error updating record:', error);
			return false;
		}
	}

	async deleteRecord(Model, id) {
		try {
			const record = await Model.findByPk(id);
			if (record) {
				await record.destroy();
				console.log('Record deleted successfully.');
				return true;
			} else {
				console.log('Record not found, delete failed.');
				return false;
			}
		} catch (error) {
			console.error('Error deleting record:', error);
			return false;
		}
	}
}


module.exports = DatabaseHandler;


// SAMPLE USECASE
// const User = dbHandler.defineModel('User', {
// 	firstName: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	lastName: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 	},
// 	email: {
// 		type: DataTypes.STRING,
// 		allowNull: false,
// 		unique: true,
// 	},
// });

// dbHandler.createRecord(User, {
// 	firstName: 'John Dave',
// 	lastName: 'Pega',
// 	email: 'test@example.com',
// });

// dbHandler.findRecordById(User, 1);
// dbHandler.updateRecord  (User, 1, { firstName: 'JD' });
// dbHandler.deleteRecord  (User, 1);

