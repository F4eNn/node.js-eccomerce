/** @format */

const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	})
}
exports.postAddProduct = async (req, res, next) => {
	const title = req.body.title
	const imageUrl = req.body.imageUrl
	const price = req.body.price
	const description = req.body.description
	try {
		const result = await Product.create({
			title: title,
			price: price,
			imageUrl: imageUrl,
			description: description,
		})
		console.log('Created product ')
		res.redirect('/admin/products')
	} catch (error) {
		console.log(error)
	}
}

exports.getEditProduct = async (req, res, next) => {
	const editMode = req.query.edit
	if (!editMode) {
		return res.redirect('/')
	}
	const prodId = req.params.productId
	try {
		const product = await Product.findByPk(prodId)
		if (!product) {
			return res.redirect('/')
		}
		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			product,
		})
	} catch (error) {
		console.log(error)
	}
}

exports.postEditProduct = async (req, res, next) => {
	const prodId = req.body.productId
	const updatedTitle = req.body.title
	const updatedPrice = req.body.price
	const updatedImageUrl = req.body.imageUrl
	const updatedDescription = req.body.description

	try {
		const product = await Product.findByPk(prodId)
		product.title = updatedTitle
		product.price = updatedPrice
		product.imageUrl = updatedImageUrl
		product.description = updatedDescription
		res.redirect('/admin/products')
		return await product.save()
	} catch (error) {
		console.log(error)
	}
}

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.findAll()
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		})
	} catch (error) {
		console.log(error)
	}
}
exports.postDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	console.log(prodId)
	try {
		const product = await Product.findByPk(prodId)
		await product.destroy()
		res.redirect('/admin/products')
	} catch (error) {
		console.log(error);
	}
}
