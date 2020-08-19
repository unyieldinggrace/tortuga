const path = require('path');
const marv = require('marv/api/promise'); // <-- Promise API
const sqliteDriver = require('@open-fidias/marv-better-sqlite3-driver');
const config = require('./data/config.json');

const driver = sqliteDriver({
	table: 'db_migrations',     // defaults to 'migrations'
	connection: {
		path: path.resolve(config.DBPath),
		options: {
			memory: false,
			fileMustExist: false,
			timeout: 5000,
			verbose: null // function or null
		} // See https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#new-databasepath-options
	}
});

let runMigrations = async (pathToMigrationsDir) => {
	console.log(pathToMigrationsDir);
	const directory = path.resolve(pathToMigrationsDir);

	const migrations = await marv.scan(directory);
	console.log(migrations);

	await marv.migrate(migrations, driver);
	console.log('Done.');
};

runMigrations(path.resolve('migrations'));
