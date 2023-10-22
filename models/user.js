/** @format */

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	resetToken: String,
	resetTokenExpiration: Date,
	cart: {
		items: [
			{
				productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
				quantity: { type: Number, required: true },
			},
		],
	},
})

userSchema.methods.addToCart = async function (product) {
	const cartProductIndex = this.cart.items.findIndex(cp => {
		return cp.productId.toString() === product._id.toString()
	})
	let newQuantity = 1
	const updatedCartItems = [...this.cart.items]

	if (cartProductIndex >= 0) {
		newQuantity = this.cart.items[cartProductIndex].quantity + 1
		updatedCartItems[cartProductIndex].quantity = newQuantity
	} else {
		updatedCartItems.push({ productId: product._id, quantity: newQuantity })
	}
	const updatedCart = { items: updatedCartItems }
	this.cart = updatedCart
	return this.save()
}

userSchema.methods.removeFromCart = function (prodId) {
	const updatedCartItems = this.cart.items.filter(i => i.productId.toString() !== prodId.toString())
	this.cart.items = updatedCartItems
	return this.save()
}

userSchema.methods.clearCart = function () {
	this.cart = { items: [] }
	return this.save()
}

module.exports = mongoose.model('Users', userSchema)

// /** @format */
// const getDb = require('../util/database').getDb
// const mongodb = require('mongodb')
// const ObjectId = mongodb.ObjectId

// class User {
// 	constructor(username, email, cart, id) {
// 		this.name = username
// 		this.email = email
// 		this.cart = cart
// 		this._id = id
// 	}
// 	async save() {
// 		try {
// 			const db = getDb()
// 			await db.collection('users').insertOne(this)
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}

// 	async addToCart(product) {

// 		const cartProductIndex = this.cart.items.findIndex(cp => {
// 			return cp.productId.toString() === product._id.toString()
// 		})
// 		let newQuantity = 1
// 		const updatedCartItems = [...this.cart.items]

// 		if (cartProductIndex >= 0) {
// 			newQuantity = this.cart.items[cartProductIndex].quantity + 1
// 			updatedCartItems[cartProductIndex].quantity = newQuantity
// 		} else {
// 			updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity })
// 		}
// 		const updatedCart = { items: updatedCartItems }
// 		const db = getDb()
// 		return await db.collection('users').updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } })
// 	}

// 	async getCart() {
// 		const db = getDb()
// 		const productIds = this.cart.items.map(i => {
// 			return i.productId
// 		})
// 		const cartItems = await db
// 			.collection('products')
// 			.find({ _id: { $in: productIds } })
// 			.toArray()

// 		return cartItems.map(p => {
// 			return {
// 				...p,
// 				quantity: this.cart.items.find(i => {
// 					return i.productId.toString() === p._id.toString()
// 				}).quantity,
// 			}
// 		})
// 	}
// 	async deleteItemFromCart(prodId) {
// 		const updatedCartItems = this.cart.items.filter(i => i.productId.toString() !== prodId.toString())
// 		const db = getDb()
// 		return db
// 			.collection('users')
// 			.updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } })
// 	}
// 	async addOrder() {
// 		const db = getDb()
// 		try {
// 			const products = await this.getCart()
// 			const order = {
// 				items: products,
// 				user: {
// 					_id: new ObjectId(this._id),
// 					name: this.name,
// 				},
// 			}

// 			const orderResult = await db.collection('orders').insertOne(order)
// 			this.cart = { items: [] }
// 			await db
// 				.collection('users')
// 				.updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } })
// 			return orderResult
// 		} catch (err) {
// 			console.log(err)
// 		}
// 	}
// 	async getOrders() {
// 		const db = getDb()
// 		return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray()
// 	}
// 	static async findById(userId) {
// 		try {
// 			const db = getDb()
// 			return await db.collection('users').findOne({ _id: new ObjectId(userId) })
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}
// }

// module.exports = User
