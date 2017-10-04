'use strict'

const db = require('../db')

exports.up = async function () {
	let pets = db('pets');
	await pets.push({ name: 'jane' })
}

exports.down = async  function () {
	let pets = db('pets');
	await pets.pop()
}
