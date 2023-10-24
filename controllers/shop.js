/** @format */

const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')
const Order = require('../models/order')
const Product = require('../models/product')

const stripe = require('stripe')('sk_test_51O4QO6LvwyZb9dGVjEEfzNDhXrzjNM9ju4CuXbP174Adqij8N2py03U5AJPqKYuqBSj2hm3cqcF9AZBffdZCGYtS00Kayj3dDF')

const ITEMS_PER_PAGE = 2

exports.getProducts = async (req, res, next) => {

	const page = +req.query.page || 1
	let totalItems;
	try {
		const numProducts = await Product.find().countDocuments()
		totalItems = numProducts
		const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'Products',
			path: '/products',
			currentPage: page,
			totalProducts: totalItems,
			hasNextPage: ITEMS_PER_PAGE * page < totalItems,
			hasPreviousPage: page > 1,
			nextPage: page + 1,
			previousPage: page - 1,
			lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
	const page = +req.query.page || 1
	let totalItems;
	try {
		const numProducts = await Product.find().countDocuments()
		totalItems = numProducts
		const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
			currentPage: page,
			totalProducts: totalItems,
			hasNextPage: ITEMS_PER_PAGE * page < totalItems,
			hasPreviousPage: page > 1,
			nextPage: page + 1,
			previousPage: page - 1,
			lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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


exports.getCheckout = async (req, res, next) => {

	try {
		const products = await req.user.populate('cart.items.productId')
		const cart = products.cart.items

		let total = 0

		cart.forEach(p => {
			total += p.quantity * p.productId.price
		})
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: cart.map((p) => {
			  return {
				quantity: p.quantity,
				price_data: {
				  currency: "usd",
				  unit_amount: p.productId.price * 100,
				  product_data: {
					name: p.productId.title,
					description: p.productId.description,
				  },
				},
			  };
			}),
			customer_email: req.user.email,
			success_url:
			  req.protocol + "://" + req.get("host") + "/checkout/success",
			cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
		  });

		res.render('shop/checkout', {
			path: '/checkout',
			pageTitle: 'Checkout',
			products: cart,
			totalSum: total,
			sessionId: session.id
		})

	} catch (err) {
		console.log(err);
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.getCheckoutSuccess = async (req, res, next) => {
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