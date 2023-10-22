/** @format */

const crypto = require('crypto')

const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');

const transporter = nodemailer.createTransport(mailjetTransport({
  auth: {
    apiKey: 'a80c33f513e37fa1de11a660f874b1e8',
    apiSecret: '86f22b2ecd7dee58e05771ac2eae429e'
  }
}));


exports.getLogin = async (req, res, next) => {
	let msg = req.flash('error')

	if(msg.length >0){
		msg = msg[0]
	}else {
		msg = null
	}

	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		errorMsg: msg
	})
}
exports.postLogin = async (req, res, next) => {
	const email = req.body.email
	const password = req.body.password
	try {
		const user = await User.findOne({ email: email })
		if (!user) {
			req.flash('error', 'Invalid email or password.')
			return res.redirect('/login')
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
		req.flash('error', 'Invalid email or password.')
		res.redirect('/login')
	} catch (error) {
		console.log(error)
		res.redirect('/login')
	}
}

exports.getSignup = (req, res, next) => {
	let msg = req.flash('error')

	if(msg.length >0){
		msg = msg[0]
	}else {
		msg = null
	}

	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMsg: msg
	})
}

exports.postSignup = async (req, res, next) => {
try {
	const email = req.body.email
	const password = req.body.password
	const confirmPassword = req.body.confirmPassword
	

	const userDoc = await User.findOne({ email: email })
	if (userDoc) {
		req.flash('error', 'Email exist already, please pick a different one.')
		
		return res.redirect('/signup')
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
	  console.log(info);
} catch (error) {
	console.log(error);
}
}

exports.postLogout = async (req, res, next) => {
	req.session.destroy(err => {
		console.log(err)
		res.redirect('/')
	})
}

exports.getReset =  (req,res,next) =>{
	let msg = req.flash('error')

	if(msg.length >0){
		msg = msg[0]
	}else {
		msg = null
	}
	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMsg: msg
	})
}

exports.postReset =  (req,res,next) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if(err){
				console.log(err);
				return res.redirect('/reset')
			}
			const token = buffer.toString('hex')
			const user = await User.findOne({email: req.body.email})
			if(!user) {
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
	} catch (error) {
		console.log(error);
	}
}
exports.getNewPassword = async (req,res,next) => {

	try {
		const token = req.body.params.token
		console.log(token);
	const user = await User.findOne({resetToken: token})
	console.log(user);
	
	let msg = req.flash('error')

	if(msg.length >0){
		msg = msg[0]
	}else {
		msg = null
	}
	res.render('auth/new-password', {
		path: '/new-password',
		pageTitle: 'New Password',
		errorMsg: msg,
		userId:user._id.toString()
	})

	} catch (error) {
		console.log(error);
	}
}