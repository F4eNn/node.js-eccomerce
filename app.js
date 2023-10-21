/** @format */

const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const error = require('./controllers/error')
const User = require('./models/user')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(async (req, res, next) => {
	try {
		const user = await User.findById('65338177b1f6730ab1b597ab')
		req.user = user
		next()
	} catch (error) {
		console.log(error)
	}
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(error.get404)

mongoose
	.connect('mongodb+srv://mati:Seconds1!@cluster0.bnjw8mh.mongodb.net/shop?retrywrites=true')
	.then(result => {
		User.findOne().then(user => {
			if (!user) {
				const user = new User({
					name: 'mati',
					email: 'mateusz4k@outlook.com',
					cart: { items: [] },
				})
				user.save()
			}
		})

		app.listen(3000)
	})
	.catch(err => console.log(err))
