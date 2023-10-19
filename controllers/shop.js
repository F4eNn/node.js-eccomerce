/** @format */

const Cart = require('../models/cart')
const Product = require('../models/product')

exports.getProducts = (req, res, next) => {
	const products = Product.fetchAll(products => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		})
	})
}

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId
	Product.findById(prodId, product => {
		console.log(product)
		res.render('shop/product-detail', { product, pageTitle: product.title, path: '/products' })
	})
}

exports.getIndex = async (req, res, next) => {
	try {
		const [rows, fieldData] = await Product.fetchAll()
		res.render('shop/index', {
			prods: rows,
			pageTitle: 'Shop',
			path: '/',
		})
	} catch (error) {
		console.log(error)
	}
}
exports.getCart = (req, res, next) => {
	Cart.getCart(cart => {
		Product.fetchAll(products => {
			const cartProducts = []
			for (const product of products) {
				const cartProductData = cart.products.find(prod => prod.id === product.id)
				if (cartProductData) {
					cartProducts.push({ productData: product, qty: cartProductData.qty })
				}
			}

			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: cartProducts,
			})
		})
	})
}
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId
	Product.findById(prodId, product => {
		Cart.addProduct(prodId, product.price)
	})
	res.redirect('/cart')
}
exports.getOrders = (req, res, next) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your orders',
	})
}
exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	})
}

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId
	Product.findById(prodId, product => {
		Cart.deleteProduct(prodId, product.price)
		res.redirect('/cart')
	})
}
