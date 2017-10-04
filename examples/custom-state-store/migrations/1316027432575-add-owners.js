'use strict'

const db = require('../db')

exports.up = async function () {
	let owners = db('owners');
	await owners.push({ name: 'taylor' })
	await owners.push({ name: 'tj' })
}

exports.down = async  function () {
	delete db.object['owners']
	await db.write()
}
