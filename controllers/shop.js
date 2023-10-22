/** @format */

const Order = require('../models/order')
const Product = require('../models/product')

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find()
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		})
	} catch (error) {
		console.log(error)
	}
}

exports.getProduct = async (req, res, next) => {
	const prodId = req.params.productId

	try {
		const product = await Product.findById(prodId)
		res.render('shop/product-detail', {
			product: product,
			pageTitle: product.title,
			path: '/products',
		})
	} catch (error) {
		console.log(error)
	}
}

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.find()
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
		})
	} catch (error) {
		console.log(error)
	}
}
exports.getCart = async (req, res, next) => {
	try {
		const products = await req.user.populate('cart.items.productId')
		const cart = products.cart.items

		res.render('shop/cart', {
			path: '/cart',
			pageTitle: 'Your Cart',
			products: cart,
		})
	} catch (error) {
		console.log(error)
	}
}
exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId

	try {
		const product = await Product.findById(prodId)
		res.redirect('/cart')
		return await req.user.addToCart(product)
	} catch (err) {
		console.log(err)
	}
}
exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	try {
		await req.user.removeFromCart(prodId)
		res.redirect('/cart')
	} catch (error) {
		console.log(error)
	}
}

exports.postOrder = async (req, res, next) => {
	try {
		const user = await req.user.populate('cart.items.productId')
		const cart = user.cart.items.map(i => {
			return { quantity: i.quantity, productData: { ...i.productId._doc } }
		})
		const order = new Order({
			user: {
				email: req.user.email,
				userId: req.user._id,
			},
			products: cart,
		})
		await order.save()
		await req.user.clearCart()
		res.redirect('/orders')
	} catch (error) {
		console.log(error)
	}
}
exports.getOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ 'user.userId': req.user._id })
		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders,
		})
	} catch (error) {
		console.log(error)
	}
}
