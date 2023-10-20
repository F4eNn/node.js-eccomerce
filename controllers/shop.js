/** @format */

const Product = require('../models/product')

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.findAll()
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
		const product = await Product.findAll({ where: { id: prodId } })
		res.render('shop/product-detail', { product: product[0], pageTitle: product[0].title, path: '/products' })
	} catch (error) {
		// console.log(error)
	}
}

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.findAll()
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
		const cart = await req.user.getCart()
		const products = await cart.getProducts()
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
		const cart = await req.user.getCart()
		const products = await cart.getProducts({ where: { id: prodId } })
		let product
		if (products.length > 0) {
			product = products[0]
		}
		let newQuantity = 1

		if (product) {
			const oldQuantity = product.cartItem.quantity
			newQuantity = oldQuantity + 1
			res.redirect('/cart')
			return cart.addProduct(product, { through: { quantity: newQuantity } })
		}
		const newProduct = await Product.findByPk(prodId)
		cart.addProduct(newProduct, { through: { quantity: newQuantity } })
		res.redirect('/cart')
	} catch (error) {
		console.log(error)
	}
}
exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	try {
		const cart = await req.user.getCart()
		const products = await cart.getProducts({ where: { id: prodId } })
		const currentProduct = products[0]
		await currentProduct.cartItem.destroy()
		res.redirect('/cart')
	} catch (error) {
		console.log(error)
	}
}

exports.postOrder = async (req, res, next) => {
	try {
		const cart = await req.user.getCart()
		const order = await req.user.createOrder()
		const products = await cart.getProducts()
		await order.addProducts(
			products.map(product => {
				product.orderItem = { quantity: product.cartItem.quantity }
				return product
			})
		)
		await cart.setProducts(null)
		res.redirect('/orders')
	} catch (error) {
		console.log(error)
	}
}
exports.getOrders = async (req, res, next) => {
	try {
		const orders = await req.user.getOrders({include: ['products']})
		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders
		})
	} catch (error) {
		console.log(error);
	}

}

