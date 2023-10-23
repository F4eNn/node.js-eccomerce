/** @format */

const { ValidationError } = require('sequelize')
const Product = require('../models/product')
const { validationResult } = require('express-validator')
const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMsg: null,
		validationErrors: [],

	})
}
exports.postAddProduct = async (req, res, next) => {
	const title = req.body.title
	const image = req.file
	const price = req.body.price
	const description = req.body.description


	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/edit-product',
			editing: false,
			hasError: true,
			product: { title, price, description },
			errorMsg: 'Attached file is not an image',
			validationErrors: []

		})
	}
	const imageUrl = image.path

	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/edit-product',
			editing: false,
			hasError: true,
			product: { title, price, description },
			errorMsg: errors.array()[0].msg,
			validationErrors: errors.array()

		})
	}
	const product = new Product({ title, price, description, imageUrl, userId: req.user })
	try {
		await product.save()
		res.redirect('/admin/products')
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
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
			hasError: false,
			errorMsg: null,
			validationErrors: []

		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postEditProduct = async (req, res, next) => {
	const prodId = req.body.productId
	const updatedTitle = req.body.title
	const updatedPrice = req.body.price
	const image = req.file
	const updatedDescription = req.body.description




	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: { title: updatedTitle, price: updatedPrice, description: updatedDescription },
			errorMsg: errors.array()[0].msg,
			validationErrors: errors.array(),
			_id: prodId
		})
	}
	try {
		const newProduct = await Product.findById(prodId)
		if (newProduct.userId.toString() !== req.user._id.toString()) {
			return res.redirect('/')
		}
		newProduct.title = updatedTitle
		newProduct.price = updatedPrice
		if (image) {
			fileHelper.deleteFile(product.imageUrl)
			newProduct.imageUrl = image.path
		}
		newProduct.description = updatedDescription
		res.redirect('/admin/products')
		return await newProduct.save()
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find({ userId: req.user._id })
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.postDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	
	try {
		const product = await Product.findById(prodId)
		if(!product){
			return next(new Error('Product not found.'))
		}
		fileHelper.deleteFile(product.imageUrl)
		await Product.deleteOne({ _id: prodId, userId: req.user._id })
		
		res.redirect('/admin/products')
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
