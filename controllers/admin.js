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
	const product = new Product(title, price, description, imageUrl, null, req.user._id)
	try {
		await product.save()
		res.redirect('/admin/products')
	} catch (err) {
		console.log(err)
	}
}
exports.getEditProduct = async (req, res, next) => {
	const editMode = req.query.edit
	if (!editMode) {
		return res.redirect('/')
	}
	const prodId = req.params.productId
	try {
		const product = await Product.findById(prodId)
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
		const newProduct = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, prodId)
		res.redirect('/admin/products')
		return await newProduct.save()
	} catch (error) {
		console.log(error)
	}
}
exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.fetchAll()
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
	try {
		await Product.deletById(prodId)
		res.redirect('/admin/products')
	} catch (error) {
		console.log(error)
	}
}
