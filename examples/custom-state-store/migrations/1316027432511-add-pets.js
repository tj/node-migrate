'use strict'

const db = require('../db')

exports.up = async function () {
	let pets = db('pets');

	await pets.push({ name: 'tobi' })
	await pets.push({ name: 'loki' })
}

exports.down = async function () {
	delete db.object['pets']
	await db.write()
}
