/** @format */

const User = require('../models/user')

exports.getLogin = async (req, res, next) => {
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: false,
	})
}
exports.postLogin = async (req, res, next) => {
	try {
		const user = await User.findById('65338177b1f6730ab1b597ab')
		req.session.isLoggedIn = true
		req.session.user = user
		req.session.save(err => {
			console.log(err)
			res.redirect('/')
		})
	} catch (error) {
		console.log(error)
	}
}
exports.postLogout = async (req, res, next) => {
	req.session.destroy(err => {
		console.log(err)
		res.redirect('/')
	})
}
