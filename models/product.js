/** @format */

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
	title: {
		type: String,
		require: true,
	},
	price: {
		type: Number,
		require: true,
	},
	description: {
		type: String,
		require: true,
	},
	imageUrl: {
		type: String,
		require: true,
	},
	userId:{
		type: Schema.Types.ObjectId,
		ref: 'User',
		require: true,
	}
})

module.exports = mongoose.model('Product', productSchema)

// /** @format */
// const mongoDb = require('mongodb')
// const getDb = require('../util/database').getDb

// class Product {
// 	constructor(title, price, description, imageUrl, id, userId) {
// 		this.title = title
// 		this.price = price
// 		this.description = description
// 		this.imageUrl = imageUrl
// 		this._id = id ? new mongoDb.ObjectId(id) : null
// 		this.userId = userId
// 	}

// 	async save() {
// 		const db = getDb()
// 		let dbOp
// 		try {
// 			if (this._id) {
// 				dbOp = await db.collection('products').updateOne({ _id: this._id }, { $set: this })
// 			} else {
// 				dbOp = await db.collection('products').insertOne(this)
// 			}
// 			return dbOp
// 		} catch (err) {
// 			console.log(err)
// 		}
// 	}
// 	static async fetchAll() {
// 		try {
// 			const db = getDb()
// 			const products = await db.collection('products').find().toArray()
// 			return products
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}

// 	static async findById(prodId) {
// 		try {
// 			const db = getDb()
// 			const product = await db
// 				.collection('products')
// 				.find({ _id: new mongoDb.ObjectId(prodId) })
// 				.next()
// 			return product
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}
// 	static async deletById(prodId) {
// 		try {
// 			const db = getDb()
// 			const product = await db.collection('products').deleteOne({ _id: new mongoDb.ObjectId(prodId) })
// 			return product
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}
// }

// module.exports = Product
