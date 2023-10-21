/** @format */

const mongoDb = require('mongodb')
const mongoClient = mongoDb.MongoClient

let _db

const mongoConnect = cb => {
	mongoClient
		.connect('mongodb+srv://mati:Seconds1!@cluster0.bnjw8mh.mongodb.net/shop?retryWrites=true&w=majority')
		.then(client => {
			console.log('Connected')
			_db = client.db()
			cb()
		})
		.catch(err => {
			console.log(err)
			throw err
		})
}

const getDb = () => {
	if (_db) {
		return _db
	}
    throw 'No database found!'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb
