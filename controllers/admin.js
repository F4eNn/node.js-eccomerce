/** @format */

const { ValidationError } = require('sequelize')
const Product = require('../models/product')
const { validationResult } = require('express-validator')

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
	const imageUrl = req.body.imageUrl
	const price = req.body.price
	const description = req.body.description
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/edit-product',
			editing: false,
			hasError: true,
			product: { title, imageUrl, price, description },
			errorMsg: errors.array()[0].msg,
			validationErrors: errors.array()

		})
	}
	const product = new Product({ title, price, description, imageUrl, userId: req.user })
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
			hasError: false,
			errorMsg: null,
			validationErrors: []

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

	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: { title: updatedTitle, imageUrl: updatedImageUrl, price: updatedPrice, description: updatedDescription },
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
		newProduct.imageUrl = updatedImageUrl
		newProduct.description = updatedDescription
		res.redirect('/admin/products')
		return await newProduct.save()
	} catch (error) {
		console.log(error)
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
	} catch (error) {
		console.log(error)
	}
}
exports.postDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId
	try {
		await Product.deleteOne({ _id: prodId, userId: req.user._id })
		res.redirect('/admin/products')
	} catch (error) {
		console.log(error)
	}
}
