'use strict'

const db = require('../db')

exports.up = async function () {
	let pets = db('pets');

	let taylor = await pets
		.chain()
		.find({name: 'tobi'})
		.assign({coolest: true})
		.value()

	console.log('taylor', taylor);
}

exports.down = async  function () {
	let pets = db('pets');

	await pets
		.chain()
		.find({name: 'tobi'})
		.unset('coolest')
		.value()
}
