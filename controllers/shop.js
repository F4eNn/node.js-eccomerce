/** @format */

const Product = require('../models/product')

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.fetchAll()
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
		res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' })
	} catch (error) {
		console.log(error)
	}
}

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.fetchAll()
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
		const products = await req.user.getCart()

		res.render('shop/cart', {
			path: '/cart',
			pageTitle: 'Your Cart',
			products: products,
		})
	} catch (error) {
		console.log(error)
	}
}
exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId

	try {
		const product = await Product.findById(prodId)
		console.log('/cart:',product);
		await req.user.addToCart(product)
		res.redirect('/cart')
	} catch (err) {
		console.log(err)
	}
}
exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	try {
		await req.user.deleteItemFromCart(prodId)
		res.redirect('/cart')
	} catch (error) {
		console.log(error)
	}
}

exports.postOrder = async (req, res, next) => {
	try {
		const cart = await req.user.addOrder()
		console.log(cart);
		res.redirect('/orders')
	} catch (error) {
		console.log(error)
	}
}
exports.getOrders = async (req, res, next) => {
	try {
		const orders = await req.user.getOrders()
		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders,
		})
	} catch (error) {
		console.log(error)
	}
}
