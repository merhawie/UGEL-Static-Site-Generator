#! /usr/bin/env node
//https://blog.logrocket.com/creating-a-cli-tool-with-node-js/
const { program } = require('commander')
const getdb2md =  require('./commands/getdb2md')

program
	.command('getdb2md')
	.description('Get database and convert contents to markdown.')
	.requiredOption('-u, --user <username>', 'username for MongoDB account.',"newUser")
	.requiredOption('-p, --pass <password>', 'password for MongoDB account.',"cNbvO3tZBQdQXbwb")
	.requiredOption('-c, --cluster <cluster>', 'cluster name for MongoDB account.','legal.fpv3r')
	.requiredOption('-d, --dbName <dbName>', 'DB name for MongoDB cluster.',"legal")
	.action(getdb2md)

program.parse(process.argv);

//getdb2md getdb2md -u "newUser" -p "cNbvO3tZBQdQXbwb" -c 'legal.fpv3r' -d "legal"