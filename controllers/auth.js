/** @format */

const crypto = require('crypto')

const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');

const { validationResult } = require('express-validator')

const transporter = nodemailer.createTransport(mailjetTransport({
	auth: {
		apiKey: 'a80c33f513e37fa1de11a660f874b1e8',
		apiSecret: '86f22b2ecd7dee58e05771ac2eae429e'
	}
}));


exports.getLogin = async (req, res, next) => {
	let msg = req.flash('error')

	if (msg.length > 0) {
		msg = msg[0]
	} else {
		msg = null
	}

	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		errorMsg: msg,
		oldInput: {
			email: '',
			password: ''
		},
		validationErrors: []
	})
}
exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	const password = req.body.password

	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/login', {
			path: '/login',
			pageTitle: 'Login',
			errorMsg: errors.array()[0].msg,
			oldInput: {
				email,
				password
			},
			validationErrors: errors.array()
		})
	}


	try {
		const user = await User.findOne({ email: email })
		if (!user) {
			return res.status(422).render('auth/login', {
				path: '/login',
				pageTitle: 'Login',
				errorMsg: 'Invalid email or password.',
				oldInput: {
					email,
					password
				},
				validationErrors: []
			})
		}
		const doMatch = await bcrypt.compare(password, user.password)
		if (doMatch) {
			req.session.isLoggedIn = true
			req.session.user = user
			return req.session.save(err => {
				console.log(err)
				res.redirect('/')
			})
		}
		return res.status(422).render('auth/login', {
			path: '/login',
			pageTitle: 'Login',
			errorMsg: 'Invalid email or password.',
			oldInput: {
				email,
				password
			},
			validationErrors: []
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.getSignup = (req, res, next) => {
	let msg = req.flash('error')

	if (msg.length > 0) {
		msg = msg[0]
	} else {
		msg = null
	}

	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMsg: msg,
		oldInput: { email: '', password: '', confirmPassword: '' },
		validationErrors: []
	})
}

exports.postSignup = async (req, res, next) => {
	try {
		const email = req.body.email
		const password = req.body.password

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(422).render('auth/signup', {
				path: '/signup',
				pageTitle: 'Signup',
				errorMsg: errors.array()[0].msg,
				oldInput: { email, password, confirmPassword: req.body.confirmPassword },
				validationErrors: errors.array()
			})
		}
		const hashedPassword = await bcrypt.hash(password, 12)
		const user = new User({ email, password: hashedPassword, cart: { items: [] } })
		await user.save()
		res.redirect('/login')

		await transporter.sendMail({
			from: 'mateusz4k@outlook.com',
			to: email,
			subject: "Hello Mati",
			html: "<b>testowa wiadomosc, działa</b>",
		});
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postLogout = async (req, res, next) => {
	req.session.destroy(err => {
		console.log(err)
		res.redirect('/')
	})
}

exports.getReset = (req, res, next) => {
	let msg = req.flash('error')

	if (msg.length > 0) {
		msg = msg[0]
	} else {
		msg = null
	}
	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMsg: msg
	})
}

exports.postReset = (req, res, next) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if (err) {
				console.log(err);
				return res.redirect('/reset')
			}
			const token = buffer.toString('hex')
			const user = await User.findOne({ email: req.body.email })
			if (!user) {
				req.flash('error', 'No account with that email found.')
				return res.redirect('/reset')
			}
			user.resetToken = token
			user.resetTokenExpiration = Date.now() + 3600000;
			await user.save()
			res.redirect('/')

			await transporter.sendMail({
				from: 'mateusz4k@outlook.com',
				to: req.body.email,
				subject: "Password reset",
				html: `
				<p>You requested password reset</p>
				<p>Click this <a href="http://localhost:3000/reset/${token}" >link</a> to set a new password.</p>
				`,
			});
		})
	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}
exports.getNewPassword = async (req, res, next) => {

	try {
		const token = req.params.token
		const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })

		let msg = req.flash('error')

		if (msg.length > 0) {
			msg = msg[0]
		} else {
			msg = null
		}
		res.render('auth/new-password', {
			path: '/new-password',
			pageTitle: 'New Password',
			errorMsg: msg,
			userId: user._id.toString(),
			passwordToken: token
		})

	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}
}

exports.postNewPassword = async (req, res, next) => {
	const newPassword = req.body.password
	const userId = req.body.userId
	const passwordToken = req.body.passwordToken

	try {
		const user = await User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
		const hashedNewPasword = await bcrypt.hash(newPassword, 12)

		user.password = hashedNewPasword
		user.resetToken = null
		user.resetTokenExpiration = null
		await user.save()
		res.redirect('/login')

	} catch (err) {
		const error = new Error(err)
		error.httpStatusCode = 500
		return next(error)
	}



}