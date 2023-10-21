/** @format */

const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const error = require('./controllers/error')
const mongoConnect = require('./util/database').mongoConnect
const User = require('./models/user')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(async (req, res, next) => {
	try {
		const user = await User.findById('6532a49f722ef673139f508e')
		req.user = new User(user.name, user.email, user.cart, user._id)
        next()
	} catch (error) {
		console.log(error)
	}
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use(error.get404)

mongoConnect(() => {
	app.listen(3000)
})
