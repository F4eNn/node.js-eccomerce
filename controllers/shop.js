/** @format */

const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId

	try {
		const product = await Product.findById(prodId)
		res.redirect('/cart')
		return await req.user.addToCart(product)
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	try {
		await req.user.removeFromCart(prodId)
		res.redirect('/cart')
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)

	}
}

exports.getInvoice = async (req, res, next) => {
	const orderId = req.params.orderId
	let order;
	try {
		order = await Order.findById(orderId)
		if (!order) {
			return next(new Error('No order found.'))
		}
		if (order.user.userId.toString() !== req.user._id.toString()) {
			return next(new Error('Unauthorized'))
		}

	} catch (error) {
		next(error)
	}
	const invoiceName = 'invoice-' + orderId + '.pdf'
	const invoicePath = path.join('data', 'invoices', invoiceName)

	const pdfDoc = new PDFDocument()
	res.setHeader('Content-Type', 'application/pdf')
	res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

	pdfDoc.pipe(fs.createWriteStream(invoicePath))
	pdfDoc.pipe(res)
	pdfDoc.fontSize(26).text('Invoice', {
		underline: true
	})
	pdfDoc.text('---------------------')

	let totalPrice = 0

	order.products.forEach(prod => {
		totalPrice += + prod.quantity * prod.productData.price
		pdfDoc.fontSize(14).text(prod.productData.title + '-' + prod.quantity + '-' + ' x ' + ' $ ' + prod.productData.price)
	})
	pdfDoc.text('------')
	pdfDoc.fontSize(20).text('Total Price: $' + totalPrice)

	pdfDoc.end()
}